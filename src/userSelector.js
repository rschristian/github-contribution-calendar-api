import Prism from 'prismjs';
import 'prismjs/components/prism-json';
Prism.manual = true;

const HOST =
    import.meta.env.NODE_ENV !== 'production'
        ? 'http://localhost:5000'
        : 'https://gh-calendar.rschristian.dev';

if (import.meta.env.NODE_ENV !== 'production') {
    while (!document.querySelector('#user-selector')) {
        await new Promise((r) => setTimeout(r, 10));
    }
}

const userSelector = document.getElementById('user-selector');

getUserData({ target: { value: 'rschristian' } });
async function getUserData(e) {
    try {
        const username = e.target.value || 'undefined';
        const response = await (await fetch(`${HOST}/user/${username}?limit=3`)).json();
        const jsonElement = document.getElementById('jsonData');
        jsonElement.innerHTML = JSON.stringify(
            response.message
                ? response
                : {
                      total: response.total,
                      contributions: response.contributions,
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
