const polka = require('polka');
const helmet = require('helmet');
const sirv = require('sirv');
const NodeCache = require('node-cache');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const { PORT = 3000 } = process.env;
const cache = new NodeCache({ stdTTL: 86400 });

const setHeaders = async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'private,max-age=86400,immutable');
    next();
};

polka()
    .use(helmet(), sirv('assets'))
    .use(setHeaders)
    .get('/user/:username', async (req, res) => {
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

const getUserData = async (requestedUser) => {
    const data = await fetch(`https://github.com/users/${requestedUser}/contributions`);
    const $ = cheerio.load(await data.text());

    if ($('.js-yearly-contributions').length < 1) return { message: 'User does not exist' };

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
            intensity: defaultColorArray[$day.attr('fill')],
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

// const defaultData = () => {
//     const contributionData = [];
//
//     const date = new Date();
//     const numberOfWeeks = date.getDay() === 0 ? 52 : 53;
//     for (let i = 0; i < numberOfWeeks; i++) contributionData.push([]);
//
//     const totalDays = 52 * 7 + date.getDay();
//     for (let i = 0; i < totalDays; i++) {
//         const tempDate = new Date();
//         tempDate.setDate(date.getDate() - (totalDays - i));
//         contributionData[Math.floor(i / 7)].push({
//             date: tempDate,
//             count: 0,
//             intensity: 0,
//         });
//     }
//     return {
//         total: 0,
//         contributions: contributionData,
//     };
// };
