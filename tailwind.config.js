/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          soft: '#FEF2F2',
          border: '#FECACA',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          soft: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F8FAFC',
          muted: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        'card-hover': '0 10px 24px rgba(15,23,42,0.08)',
        panel: '0 8px 30px rgba(15,23,42,0.06)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
