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
        forma: {
          obsidian: '#0B0D0F',
          surface: '#111418',
          card: '#161A1F',
          elevated: '#1D2228',
          border: '#262C35',
          borderHover: '#373F4B',
          lime: 'var(--color-lime, #C7F36B)',
          limeHover: 'var(--color-lime-hover, #B8E65A)',
          limeDim: 'var(--color-lime-dim, rgba(199, 243, 107, 0.14))',
          limeGlow: 'var(--color-lime-glow, rgba(199, 243, 107, 0.28))',
          white: '#F5F5F2',
          muted: '#8B9198',
          subtle: '#5A616A',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          info: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'lime-glow': '0 0 20px -3px var(--color-lime-glow, rgba(199, 243, 107, 0.28))',
        'lime-sm': '0 0 10px -2px var(--color-lime-glow, rgba(199, 243, 107, 0.3))',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'elevated': '0 8px 30px -4px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-grid': 'linear-gradient(to right, #1E232A 1px, transparent 1px), linear-gradient(to bottom, #1E232A 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-pattern': '24px 24px',
      }
    },
  },
  plugins: [],
}
