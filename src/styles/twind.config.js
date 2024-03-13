import { defineConfig } from '@twind/core';
import presetTailwind from '@twind/preset-tailwind';

export const twindConfig = defineConfig({
    darkMode: 'class',
    presets: [presetTailwind()],
    ignorelist: [
        'dark',
        'language-json',
        'token',
        'punctuation',
        'property',
        'operator',
        'number',
        'string',
    ],
    hash: false,
    theme: {
        extend: {
            fontSize: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            height: {
                '1/2': '50vh',
                '3/4': '75vh',
            },
        },
        colors: {
            primary: {
                DEFAULT: '#00b7f3',
                light: '#99daff',
            },
            content: {
                DEFAULT: '#292929',
                dark: '#ddd',
            },
            page: {
                DEFAULT: '#f8f8f8',
                dark: '#27272a',
            },
            code: {
                DEFAULT: '#fff',
                inline: '#99a1b3',
                dark: '#18181b',
            },
            white: {
                muted: '#999',
                DEFAULT: '#ffffff',
            },
            transparent: 'transparent',
        },
    },
    variants: [['hocus', '&:hover,&:focus-visible']],
});
