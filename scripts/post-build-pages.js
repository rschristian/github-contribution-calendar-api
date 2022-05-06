import { promises as fs } from 'fs';

(async function PostBuildProcessing() {
    let html = await fs.readFile('./dist/index.html', 'utf-8');

    // Scripts
    const userSelectorJS = await fs.readFile(
        `dist/${(await fs.readdir('dist')).find((entry) => /^userSelector/.test(entry))}`,
        'utf-8',
    );

    html = html.replace(/<script([^\n]*)/g, '');
    html = html.replace(
        '<!-- UserSelector -->',
        `<script type="module">${userSelectorJS}</script>`,
    );

    // CSS
    const globalCSS = await fs.readFile(
        `dist/assets/styles/${(await fs.readdir('dist/assets/styles'))[0]}`,
        'utf-8',
    );
    html = html.replace(/<link rel="stylesheet"([^\n]*)/, `<style>${globalCSS}</style>`);

    await fs.writeFile('./dist/index.html', html);
})();
