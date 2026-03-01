/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:          '#0A0A0A',
        'bg-panel':  '#0F0F0F',
        'bg-card':   '#141414',
        'bg-hover':  '#1A1A1A',
        primary:     '#F97316',
        'primary-dim':'#EA580C',
        border:      '#1F1F1F',
        'text-prim': '#E5E5E5',
        'text-dim':  '#525252',
        'text-mono': '#A3A3A3',
        critical:    '#EF4444',
        warning:     '#F59E0B',
        safe:        '#22C55E',
        info:        '#6B7280',
      },
      fontFamily: {
        sans:  ['Space Grotesk', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '1px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
