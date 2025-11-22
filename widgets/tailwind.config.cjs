/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.html',
    './src/**/*.vue'
  ],
  safelist: [
    { pattern: /grid-cols-(1|2|3|4|5|6|7|8|9)/ },
    { pattern: /bg-(green|amber|blue)-500/ }
  ],
  theme: {
    extend: {},
  }
}

