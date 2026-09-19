/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5F2ED',
          300: '#EBE5DD',
        },
        charcoal: {
          900: '#1F1B27',
          800: '#2D2938',
          700: '#3D374B',
          600: '#524B62',
          500: '#6C657E',
          400: '#8E87A0',
          300: '#B6B0C4',
          200: '#DEDAE6',
          100: '#F0EEF5',
        },
        lavender: {
          50: '#F7F5FB',
          100: '#EFEBFA',
          200: '#DCD0ED',
          300: '#C5B5DF',
          400: '#A794CD',
          500: '#8E7DBE',
          600: '#7563A7',
          700: '#5E4E8D',
        },
        lilac: {
          light: '#F5F0FA',
          DEFAULT: '#EADCFA',
          dark: '#BCA4DF',
        },
        blush: {
          light: '#FFF0F5',
          DEFAULT: '#FDE8F1',
          border: '#F8C8DC',
          accent: '#E78AA9',
        },
        peach: {
          light: '#FFF6F0',
          DEFAULT: '#FFE9DE',
          accent: '#F3A479',
        },
        powder: {
          light: '#F0F6FD',
          DEFAULT: '#E1EDFB',
          accent: '#7AAAE6',
        },
        // Queue status pastel tones
        status: {
          low: {
            bg: '#EAF7EE',
            text: '#2D7549',
            border: '#BFE7CB',
            dot: '#58AB78',
          },
          moderate: {
            bg: '#FEF6E4',
            text: '#8F5E0F',
            border: '#FADFA6',
            dot: '#DE982B',
          },
          high: {
            bg: '#FDF0F2',
            text: '#9C2B3E',
            border: '#F6BCC5',
            dot: '#DF5C72',
          },
          learning: {
            bg: '#F2EFF6',
            text: '#686077',
            border: '#D8D2E4',
            dot: '#9E98AA',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(60, 40, 80, 0.05), 0 1px 4px -1px rgba(60, 40, 80, 0.03)',
        'soft': '0 4px 20px -4px rgba(60, 40, 80, 0.06), 0 2px 8px -2px rgba(60, 40, 80, 0.03)',
        'soft-lg': '0 12px 32px -6px rgba(60, 40, 80, 0.08), 0 4px 12px -2px rgba(60, 40, 80, 0.04)',
        'soft-xl': '0 20px 48px -10px rgba(60, 40, 80, 0.12), 0 8px 24px -4px rgba(60, 40, 80, 0.06)',
      }
    },
  },
  plugins: [],
}
