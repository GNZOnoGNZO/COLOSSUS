/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        medieval: {
          primary: '#8B4513',    // Saddle brown
          secondary: '#CD853F',  // Peru
          accent: '#DAA520',     // Goldenrod
          light: '#F5DEB3',      // Wheat
          dark: '#2F1810',       // Dark brown
        },
        card: {
          human: 'rgb(0, 120, 255)',
          nonhuman: 'rgb(40, 180, 90)',
          celestial: 'rgb(140, 60, 190)',
          event: 'rgb(220, 60, 50)',
          location: 'rgb(160, 120, 80)',
          object: 'rgb(130, 130, 130)',
          passive: 'rgb(255, 255, 255)',
          monster: 'rgb(30, 30, 30)',
        }
      },
      backgroundImage: {
        'day-pattern': "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=1920&h=1080')",
        'night-pattern': "url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1920&h=1080')",
      },
      animation: {
        'card-pulse': 'cardPulse 2s infinite',
        'targeting': 'targetingArrow 1s infinite linear',
      },
      borderRadius: {
        'game': '8px',
      },
    },
  },
  plugins: [],
};