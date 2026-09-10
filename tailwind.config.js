/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c',
          soft: '#fef2f2',
          border: '#fecaca',
        },
        ink: {
          DEFAULT: '#111827',
          muted: '#6b7280',
          soft: '#9ca3af',
        },
        surface: {
          DEFAULT: '#ffffff',
          page: '#f8fafc',
          muted: '#f3f4f6',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        'card-hover': '0 8px 24px rgba(16,24,40,0.08)',
      },
    },
  },
  plugins: [],
}
