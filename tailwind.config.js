/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:   '#00E5A0',
        warn:    '#FF6B35',
        surface: 'rgba(255,255,255,0.04)',
        glass:   'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'grid': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v40H0zM40 0h1v40h-1zM0 0v1h40V0zM0 40v1h40v-1z' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
