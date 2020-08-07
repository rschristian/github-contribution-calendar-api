const polka = require('polka');
const compression = require('compression');
const helmet = require('helmet');
const NodeCache = require('node-cache');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const PORT = 3000;
const cache = new NodeCache({ stdTTL: 86400 });

const defaultColorArray = {
    '#ebedf0': 0,
    '#9be9a8': 1,
    '#40c463': 2,
    '#30a14e': 3,
    '#216e39': 4,
};

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
    .listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Running on localhost:${PORT}`);
    });

const getUserData = async (requestedUser) => {
    const data = await fetch(`https://github.com/users/${requestedUser}/contributions`);
    const $ = cheerio.load(await data.text());

    const $days = $('rect.day');

    const contributionCountText = $('.js-yearly-contributions h2')
        .text()
        .trim()
        .match(/^([0-9,]+)\s/);

    let contributionCount;

    if (contributionCountText) {
        [contributionCount] = contributionCountText;
        contributionCount = parseInt(contributionCount.replace(/,/g, ''), 10);
    }

    return {
        total: contributionCount || 0,
        contributions: (() => {
            const parseDay = (day) => {
                const $day = $(day);

                return {
                    date: $day
                        .attr('data-date')
                        .split('-')
                        .map((d) => parseInt(d, 10)),
                    value: {
                        date: $day.attr('data-date'),
                        count: parseInt($day.attr('data-count'), 10),
                        intensity: defaultColorArray[$day.attr('fill').toLowerCase()] || 0,
                    },
                };
            };
            return $days.get().map((day) => parseDay(day).value);
        })(),
    };
};
