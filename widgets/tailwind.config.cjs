/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.html',
    './src/**/*.vue'
  ],
  theme: {
    extend: {
      colors: {
        "brand": '#30715e',
        "brand-dark": '#255248',
        "success": '#eefff4'
      },
    },
  }
}

