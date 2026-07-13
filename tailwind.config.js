/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './assets/js/app.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
};
