import { Router } from 'worktop';
import { reply } from 'worktop/response';
import { listen } from 'worktop/cfw';

const API = new Router();

API.add('GET', '/user/:username', async (_req, context) => {
    const requestedUser = String(context.params.username);
    const limit = Number(context.url.searchParams.get('limit') ?? -1);

    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
    };

    const userData = await getUserData(requestedUser, limit);

    if (!userData.total && !userData.contributions)
        return reply(404, JSON.stringify({ message: 'User does not exist' }), headers);

    return reply(200, JSON.stringify(userData), headers);
});

listen(API.run);

/**
 * @typedef Contribution
 * @property {string} date
 * @property {number} count
 * @property {(0 | 1 | 2 | 3 | 4)} intensity
 */

/**
 * @param {string} requestedUser
 * @param {number} [limit]
 * @returns {Promise<{ total: number, contributions: Contribution[][] }>}
 */
async function getUserData(requestedUser, limit) {
    const response = await fetch(`https://github.com/users/${requestedUser}/contributions`);

    let total;
    let dayIndex = 0;
    let contributions = [];

    // @ts-ignore
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
                if (weekIndex === limit) return;
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

    return {
        total,
        contributions,
    };
}
