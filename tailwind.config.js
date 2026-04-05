/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#141414',
        card: '#1c1c1c',
        border: '#2a2a2a',
        accent: '#e50914',
        'accent-hover': '#b20710',
        muted: '#888888',
      },
    },
  },
  plugins: [],
}
