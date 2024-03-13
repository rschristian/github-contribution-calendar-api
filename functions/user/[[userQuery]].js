const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=86400, immutable',
    'Access-Control-Allow-Origin': '*',
};

/**
 * @param {number} status
 * @param {string} message
 */
function errorResponse(status, message) {
    return new Response(JSON.stringify({ error: `Error: ${message}` }), { status, headers });
}

export async function onRequestGet(context) {
    let userQuery;
    try {
        userQuery = context.params.userQuery[0];
    } catch {}

    if (!userQuery) return errorResponse(400, 'Missing user query');

    const { searchParams } = new URL(context.request.url);
    const limit = Number(searchParams.get('limit') ?? -1);
    const year = Number(searchParams.get('year') ?? -1);

    const userData = await getUserData(userQuery, year, limit);
    if (!userData.total && !userData.contributions)
        return errorResponse(404, 'User does not exist');

    return new Response(JSON.stringify(userData), { status: 200, headers });
}

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
    const data = {};

    let nextText = '';
    let tooltipId;

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
        .on('.js-calendar-graph tool-tip', {
            /**
             * @param {Element} element
             */
            element(element) {
                tooltipId = element.getAttribute('for');
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
                    data[tooltipId] ??= {};
                    data[tooltipId].count = parseInt(count, 10) || 0;
                });
            },
        })
        .on('tr > .ContributionCalendar-day', {
            /**
             * @param {Element} element
             */
            element(element) {
                const date = element.getAttribute('data-date');
                const intensity = element.getAttribute('data-level');

                const tooltipId = element.getAttribute('id');

                data[tooltipId] ??= {};
                data[tooltipId].date = date;
                data[tooltipId].intensity = intensity;
            },
        })
        .transform(response)
        .arrayBuffer();

    const contributions = [];

    let weekIndex;
    Object.values(data)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
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
