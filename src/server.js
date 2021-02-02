import polka from 'polka';
import helmet from 'helmet';
import sirv from 'sirv';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const { PORT = 3000 } = process.env;
const cache = new NodeCache({ stdTTL: 86400 });

function setHeaders(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'private,max-age=86400,immutable');
    next();
}

polka()
    .use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                    'default-src': ['*'],
                    'script-src': ["'self'", "'sha256-tKq1d+9+VsXY1K2zr2saG2Mj8GvizZb+jiUtc/QPPSw='"],
                },
            },
        }),
        sirv('src/assets'),
    )
    .get('/user/:username', setHeaders, async (req, res) => {
        try {
            const requestedUser = String(req.params.username);

            const cachedValue = cache.get(requestedUser);
            if (cachedValue !== undefined) return res.end(JSON.stringify(cachedValue));

            const data = await getUserData(requestedUser);
            cache.set(requestedUser, data);

            res.end(JSON.stringify(data));
        } catch (error) {
            res.end(`Error: ${error}`);
        }
    })
    .get('*', async (req, res) => {
        res.writeHead(302, {
            Location: '/',
            'Content-Type': 'text/html',
        });
        res.end();
    })
    .listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Running on localhost:${PORT}`);
    });

async function getUserData(requestedUser) {
    const data = await fetch(`https://github.com/users/${requestedUser}/contributions`);
    const $ = cheerio.load(await data.text());

    if ($('.js-yearly-contributions').length < 1) return { message: 'User does not exist' };

    const legendColors = {};
    $('.legend > li')
        .toArray()
        .map((element) => $(element).css('background-color'))
        .map((color, i) => (legendColors[color] = i));

    const $days = $('rect.day');

    const contributionCountText = $('.js-yearly-contributions h2')
        .text()
        .trim()
        .match(/^([0-9,]+)\s/);

    let contributionCount = 0;
    if (contributionCountText) {
        [contributionCount] = contributionCountText;
        contributionCount = parseInt(contributionCount.replace(/,/g, ''), 10);
    }

    const parseDay = (day) => {
        const $day = $(day);

        return {
            date: $day.attr('data-date'),
            count: parseInt($day.attr('data-count'), 10),
            intensity: legendColors[$day.attr('fill')] || 0,
        };
    };
    const days = $days.get().map((day) => parseDay(day));

    const contributionData = [];
    for (let i = 0; i < Math.ceil(days.length / 7); i++) contributionData.push([]);
    for (let i = 0; i < days.length; i++) {
        contributionData[Math.floor(i / 7)].push(days[i]);
    }

    return {
        total: contributionCount,
        contributions: contributionData,
    };
}
