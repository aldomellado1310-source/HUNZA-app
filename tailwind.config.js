/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './assets/js/app.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
            },
            // Identidad de marca: sage/teal desaturado. Reemplaza el uso genérico
            // de stone-800 y blue-* como "acento" disperso por un único acento
            // consistente en las 3 vistas (login, dashboard, paciente).
            colors: {
                brand: {
                    50: '#F2F6F4',
                    100: '#E1EBE7',
                    200: '#C3D8D0',
                    300: '#9EBFB2',
                    400: '#77A290',
                    500: '#567F6E',
                    600: '#47695A',
                    700: '#3A5449',
                    800: '#2E4239',
                    900: '#24352E',
                },
            },
            boxShadow: {
                // Sombra de una sola capa, blur amplio y opacidad baja (soft-calm):
                // reemplaza la mezcla de shadow-sm/md/lg/2xl en tarjetas destacadas.
                soft: '0 24px 48px -16px rgba(36, 53, 46, 0.18)',
            },
        },
    },
    plugins: [],
};
