const polka = require('polka');
const compression = require('compression');
const helmet = require('helmet');
const NodeCache = require('node-cache');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { readFileSync } = require('fs');

const notFound = readFileSync('./index.html', 'utf8');

const PORT = 3000;
const cache = new NodeCache({ stdTTL: 86400 });

const setHeaders = async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'private,max-age=86400,immutable');
    next();
};

polka()
    .use(compression(), helmet())
    .use(setHeaders)
    .get('/user/:username', async (req, res) => {
        try {
            const requestedUser = String(req.params.username);

            const cachedValue = cache.get(requestedUser);
            if (cachedValue !== undefined) return res.end(JSON.stringify(cachedValue));

            const data = await getUserData(requestedUser);
            cache.set(requestedUser, data);

            return res.end(JSON.stringify(data));
        } catch (error) {
            return res.end(`Error: ${error}`);
        }
    })
    .get('*', async (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(notFound);
    })
    .listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Running on localhost:${PORT}`);
    });

const getUserData = async (requestedUser) => {
    const data = await fetch(`https://github.com/users/${requestedUser}/contributions`);
    const $ = cheerio.load(await data.text());

    const defaultColorArray = {};
    $('.legend > li')
        .toArray()
        .map((element) => $(element).css('background-color'))
        .map((color, i) => (defaultColorArray[color] = i));

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
            intensity: defaultColorArray[$day.attr('fill').toLowerCase()] || 0,
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
};
