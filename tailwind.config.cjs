/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'Inter', 'sans-serif'],
      },
      colors: {
        dailyforge: {
          purple: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
        },
      },
    },
  },
  plugins: [],
};
