/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        bold: ['Inter_700Bold', 'sans-serif'],
      },
      colors: {
        primary: '#0f172a', // Navy Blue
        secondary: '#f8fafc', // Slate 50
        accent: '#3b82f6', // Blue 500
      }
    },
  },
  plugins: [],
}
