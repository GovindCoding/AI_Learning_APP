/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#f4f6fa', // soft off-white/blue
          dark: '#131926', // soft premium charcoal navy
        },
        cardBg: {
          light: 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(30, 41, 59, 0.45)', // transparent slate-800
        },
        borderBg: {
          light: 'rgba(226, 232, 240, 0.9)',
          dark: 'rgba(255, 255, 255, 0.05)',
        },
        neon: {
          cyan: '#0284c7', // elegant sky blue
          violet: '#6366f1', // elegant indigo
          emerald: '#059669', // elegant emerald
          rose: '#e11d48', // elegant rose
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 24px 0 rgba(15, 23, 42, 0.04)',
        'glass-hover': '0 8px 24px 0 rgba(99, 102, 241, 0.08)',
        'neon-cyan': '0 0 10px rgba(2, 132, 199, 0.15)',
        'neon-violet': '0 0 10px rgba(99, 102, 241, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
