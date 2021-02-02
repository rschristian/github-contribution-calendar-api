import cheerio from 'cheerio';
import fs from 'fs';
import { create } from 'twind';
import { shim, virtualSheet, getStyleTag } from 'twind/shim/server';

const sheet = virtualSheet();
const { tw } = create({
    hash: false,
    theme: {
        extend: {
            fontSize: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            height: {
                '3/5': '60vh',
            },
        },
        colors: {
            navy: '#253746',
            offWhite: '#ddd',
            red: {
                DEFAULT: '#d14124',
                hover: '#f17154',
            },
        },
    },
    sheet,
});

sheet.reset();

const $ = cheerio.load(fs.readFileSync('src/assets/index.html'));
const body = cheerio.html($('#app'));

shim(body, { tw });
const styleTag = getStyleTag(sheet);
$('head').children().last().replaceWith(styleTag);

fs.writeFile('src/assets/index.html', $.html(), 'utf-8', (err) => {
    if (err) throw err;
    console.log('> Completed');
});
