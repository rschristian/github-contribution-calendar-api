import { Router } from 'worktop';
import { reply } from 'worktop/response';
import { listen } from 'worktop/cfw';

const API = new Router();

API.add('GET', '/user/:username', async (_req, context) => {
    const requestedUser = String(context.params.username);
    const limit = Number(context.url.searchParams.get('limit') ?? -1);
    const year = Number(context.url.searchParams.get('year') ?? -1);

    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
    };

    const userData = await getUserData(requestedUser, year, limit);

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
async function getUserData(requestedUser, year, limit) {
    // While GitHub's API seeming supports and uses both `from` and `to` parameters,
    // the data returned is always the year included in the `to` parameter.
    //
    // For example, if we use `?from=2020-09-01&to=2021-01-30`, we get data for the
    // full year of 2021.
    const response = await fetch(
        `https://github.com/users/${requestedUser}/contributions?to=${year}-01-01`,
    );

    let total;
    let dayIndex = 0;
    let contributions = [];

    let weekIndex;
    let date;
    let intensity;

    // @ts-ignore
    await new HTMLRewriter()
        .on('.js-yearly-contributions h2', {
            /**
             * @typedef {Object} HTMLRewriterTextChunk
             * @property {string} text
             * @property {boolean} lastInTextNode - Last chunk of the text node is always(?) empty
             */

            /**
             * @param {HTMLRewriterTextChunk} text
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
                weekIndex = Math.floor(dayIndex / 7);
                if (weekIndex === limit) return;
                if (!contributions[weekIndex]) contributions.push([]);

                date = element.getAttribute('data-date');
                intensity = element.getAttribute('data-level');
            },
            /**
             * @param {HTMLRewriterTextChunk} text
             */
            text(text) {
                if (text.lastInTextNode) return;
                if (weekIndex === limit) return;

                // ex:
                //   "No contributions on Sunday, May 29, 2022"
                //   "11 contributions on Monday, July 25, 2022"
                const count = text.text.match(/^[^\s]*/)[0];

                contributions[weekIndex].push({
                    date,
                    count: parseInt(count, 10) || 0,
                    intensity,
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
