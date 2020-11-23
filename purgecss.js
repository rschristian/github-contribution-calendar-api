const postcss = require('postcss');
const purgecss = require('@fullhuman/postcss-purgecss');
const fs = require('fs');

fs.readFile('node_modules/bulma/css/bulma.css', (err, css) => {
    postcss([
        purgecss({
            content: ['./assets/index.html'],
        }),
    ])
        .process(css, { from: 'node_modules/bulma/css/bulma.css', to: 'assets/bulma.css' })
        .then((result) => fs.writeFile('assets/bulma.css', result.css, () => true));
});
