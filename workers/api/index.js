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

/**
 * @param {string} requestedUser
 */
async function getUserData(requestedUser) {
    const response = await fetch(`https://github.com/users/${requestedUser}/contributions`);

    let total;
    let dayIndex = 0;
    let contributions = [];

    await new HTMLRewriter()
        .on('.js-yearly-contributions h2', {
            /**
             * @param {Object} text
             * @param {string} text.text
             * @param {boolean} text.lastInTextNode - Last chunk of the text node is always(?) empty
             */
            text(text) {
                if (text.lastInTextNode) return;
                total = parseInt(text.text.match(/[0-9,]+/)[0].replace(/,/g, ''), 10);
            },
        })
        .on('g > .ContributionCalendar-day', {
            /**
             * @param {Element} element
             */
            element(element) {
                const weekIndex = Math.floor(dayIndex / 7);
                if (!contributions[weekIndex]) contributions.push([]);
                contributions[weekIndex].push({
                    date: element.getAttribute('data-date'),
                    count: parseInt(element.getAttribute('data-count'), 10),
                    intensity: element.getAttribute('data-level'),
                });
                dayIndex++;
            },
        })
        .transform(response)
        .arrayBuffer();

    if (!total && contributions.length == 0) return { message: 'User does not exist' };

    return {
        total,
        contributions,
    };
}
