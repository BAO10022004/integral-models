/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-dark, #020205)',
        foreground: 'var(--text-main, #ffffff)',
        primarylw: '#6366f1',
      }
    },
  },
  plugins: [],
}
