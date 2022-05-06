import Prism from 'prismjs';
import 'prismjs/components/prism-json';
Prism.manual = true;

(async function userSelector() {
    if (import.meta.env.NODE_ENV !== 'production') {
        while (!document.querySelector('#user-selector')) {
            await new Promise((r) => setTimeout(r, 50));
        }
    }

    const userSelector = document.getElementById('user-selector');

    getUserData({ target: { value: 'rschristian' } });
    async function getUserData(e) {
        try {
            const username = e.target.value || 'undefined';
            const response = await (
                await fetch('https://gh-calendar.rschristian.dev/user/' + username)
            ).json();
            const jsonElement = document.getElementById('jsonData');
            jsonElement.innerHTML = JSON.stringify(
                response.message
                    ? response
                    : {
                          total: response.total,
                          contributions: response.contributions.slice(0, 3),
                      },
                null,
                2,
            );
            Prism.highlightElement(jsonElement);
        } catch (e) {
            console.log(e);
        }
    }

    userSelector.addEventListener('change', getUserData);
})();
