import { Router } from 'worktop';
import { listen } from 'worktop/cache';
import cheerio from 'cheerio';
import type { ServerRequest } from 'worktop/request';

const API = new Router();

API.add('GET', '/user/:username', async (req, res) => {
    const requestedUser = String(req.params.username);

    await logToRocket(req, requestedUser)

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const data = await getUserData(requestedUser);

    res.end(JSON.stringify(data));
});

listen(API.run);

async function logToRocket(req: ServerRequest, requestedUser: string) {
    const data = {
        'timestamp': new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
        'ip': req.headers.get('cf-connecting-ip') || '',
        'origin': req.headers.get('origin') && req.headers.get('origin') !== 'null'
            ? req.headers.get('origin')
            : req.headers.get('referer') && req.headers.get('referer') !== 'null'
                ? req.headers.get('referer')
                : '',
        'user-agent': req.headers.get('user-agent') || '',
        'city': req.cf.city || '',
        'country': req.cf.country || '',
        'requested-user': requestedUser,
    }

    await fetch(`https://logger.ryanchristian.dev/`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

async function getUserData(requestedUser: string) {
    const data = await fetch(`https://github.com/users/${requestedUser}/contributions`);
    const $ = cheerio.load(await data.text());

    if ($('.js-yearly-contributions').length < 1) return { message: 'User does not exist' };

    const contributionCountText = $('.js-yearly-contributions h2')
        .text()
        .trim()
        .match(/^[0-9,]+/);

    let contributionCount = 0;
    if (contributionCountText) {
        contributionCount = parseInt(contributionCountText[0].replace(/,/g, ''), 10);
    }

    const parseDay = (day: HTMLDivElement) => {
        const $day = $(day);

        return {
            date: $day.attr('data-date'),
            count: parseInt($day.attr('data-count'), 10),
            intensity: $day.attr('data-level'),
        };
    };
    const days = $('g > rect.ContributionCalendar-day')
        .get()
        .map((day) => parseDay(day));

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
