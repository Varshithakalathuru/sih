/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F2C4C',
        'ink-light': '#1B3E63',
        slate: '#44546B',
        paper: '#F5F6F2',
        line: '#DBE0E1',
        steel: '#2C6E8E',
        amber: '#B5721A',
        forest: '#2F6F4E',
        rust: '#A23B2D',
        violet: '#5B4B8A',
      },
      fontFamily: {
        serif: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};
