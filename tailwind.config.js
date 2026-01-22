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
        // Semantic Application Colors
        primary: {
          DEFAULT: '#2563eb', // blue-600 (Royal Blue)
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#0f172a', // slate-900
        },
        muted: {
          DEFAULT: '#f8fafc', // slate-50
          foreground: '#64748b', // slate-500
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        accent: '#0ea5e9', // sky-500

        // Re-export full slate scale if needed as 'slate' (optional, tailwind includes it by default but good to be explicit if overriding)
      }
    },
  },
  plugins: [],
}
