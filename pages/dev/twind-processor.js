import { promises as fs } from 'fs';
import { setup } from 'twind';
import { virtualSheet, getStyleTag, shim } from 'twind/shim/server';
import { minify } from 'html-minifier-terser';

const sheet = virtualSheet();

setup({
    hash: false,
    theme: {
        extend: {
            fontSize: {
                '2xl': '1.5rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            height: {
                '1/2': '50vh',
                '3/5': '60vh',
                '3/4': '75vh',
            },
        },
        colors: {
            navy: '#253746',
            offWhite: '#ddd',
            red: {
                DEFAULT: '#d14124',
                hover: '#f17154',
            },
            steel: {
                dimmer: '#b5b5b5',
                dim: '#ddd',
                DEFAULT: '#ededed',
            },
            white: '#fff',
        },
    },
    sheet,
});

(async function ssr() {
    sheet.reset();

    const html = await fs.readFile('pages/dev/index.html', 'utf8');

    shim(html);
    const styleTag = getStyleTag(sheet);

    await fs.writeFile(
        'pages/index.html',
        minify(html.replace('<style></style>', styleTag), {
            minifyJS: true,
            minifyCSS: true,
            collapseWhitespace: true,
        }),
    );
})();
