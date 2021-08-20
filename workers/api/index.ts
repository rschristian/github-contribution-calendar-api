import { Router } from 'worktop';
import { listen } from 'worktop/cache';

const API = new Router();

API.add('GET', '/user/:username', async (req, res) => {
    const requestedUser = String(req.params.username);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const data = await getUserData(requestedUser);

    res.end(JSON.stringify(data));
});

listen(API.run);

async function getUserData(requestedUser: string) {
    let response = await fetch(`https://github.com/users/${requestedUser}/contributions`);

    let total: number;
    let days = [];

    await new HTMLRewriter()
        .on('.js-yearly-contributions h2', {
            text(text) {
                // text hits twice, second time is empty
                if (total) return;
                total = parseInt(text.text.match(/[0-9,]+/)[0].replace(/,/g, ''), 10);
            },
        })
        .on('g > .ContributionCalendar-day', {
            element(element: Element) {
                days.push({
                    date: element.getAttribute('data-date'),
                    count: parseInt(element.getAttribute('data-count'), 10),
                    intensity: element.getAttribute('data-level'),
                });
            },
        })
        .transform(response)
        .arrayBuffer();

    const contributions = [];
    for (let i = 0; i < Math.ceil(days.length / 7); i++) contributions.push([]);
    for (let i = 0; i < days.length; i++) contributions[Math.floor(i / 7)].push(days[i]);

    return {
        total,
        contributions,
    };
}
