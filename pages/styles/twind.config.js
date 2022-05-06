import { defineConfig } from 'twind';
import tailwindPreset from '@twind/preset-tailwind';

export const twindConfig = defineConfig({
    presets: [tailwindPreset()],
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
            code: {
                DEFAULT: '#fff',
                inline: '#99a1b3',
                dark: '#18181b',
            },
            white: {
                muted: '#999',
                DEFAULT: '#ffffff',
            },
        },
    },
});
