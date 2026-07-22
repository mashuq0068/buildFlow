/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'glow-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(3%, -4%) scale(1.08)' },
          '66%': { transform: 'translate(-3%, 3%) scale(0.96)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.85' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-200' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'glow-float-slow': 'glow-float 16s ease-in-out infinite',
        'glow-float-slower': 'glow-float 22s ease-in-out infinite reverse',
        'glow-pulse': 'glow-pulse 6s ease-in-out infinite',
        'dash-flow': 'dash-flow 6s linear infinite',
        'spin-slow': 'spin-slow 7s linear infinite',
      },
    },
  },
  plugins: [],
};
