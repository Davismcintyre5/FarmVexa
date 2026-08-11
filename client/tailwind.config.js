/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#e8f5e9',
                    100: '#c8e6c9',
                    200: '#a5d6a7',
                    300: '#81c784',
                    400: '#66bb6a',
                    500: '#2d6a4f',
                    600: '#1b5e20',
                    700: '#14532d',
                    800: '#0f3d1e',
                    900: '#0a2812',
                },
            },
        },
    },
    plugins: [],
};