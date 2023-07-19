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
    const contributions = [];
    const dates = [];

    let date;
    let intensity;
    let nextText = '';

    /**
     * @typedef {Object} HTMLRewriterTextChunk
     * @property {string} text
     * @property {boolean} lastInTextNode - Last chunk of the text node is always(?) empty
     */

    /**
     * @param {HTMLRewriterTextChunk} text
     * @param {() => void} cb
     */
    const waitForLastTextChunk = (text, cb) => {
        nextText += text.text;
        if (text.lastInTextNode) {
            cb();
            nextText = '';
        }
    };


    // @ts-ignore
    await new HTMLRewriter()
        .on('.js-yearly-contributions h2', {
            /**
             * @param {HTMLRewriterTextChunk} text
             */
            text(text) {
                waitForLastTextChunk(
                    text,
                    () => (total = parseInt(nextText.match(/[0-9,]+/)[0].replace(/,/g, ''), 10)),
                );
            },
        })
        .on('tr > .ContributionCalendar-day', {
            /**
             * @param {Element} element
             */
            element(element) {
                date = element.getAttribute('data-date');
                intensity = element.getAttribute('data-level');
            },
            /**
             * @param {HTMLRewriterTextChunk} text
             */
            text(text) {
                waitForLastTextChunk(text, () => {
                    // ex:
                    //   "No contributions on Sunday, May 29, 2022"
                    //   "11 contributions on Monday, July 25, 2022"
                    const count = nextText.match(/^[^\s]*/)[0];
                    dates.push({
                        date,
                        count: parseInt(count, 10) || 0,
                        intensity,
                    });
                });
            },
        })
        .transform(response)
        .arrayBuffer();

    let weekIndex;
    dates
        .sort((a, b) => a.date < b.date ? -1 : 1)
        .slice(0, limit * 7)
        .forEach((day, idx) => {
            weekIndex = Math.floor(idx / 7);
            if (!contributions[weekIndex]) contributions.push([]);
            contributions[weekIndex].push(day);
        });

    return {
        total,
        contributions,
    };
}
