import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Safelist critical design system classes that might not be detected in content scan
  safelist: [
    // Space (backgrounds)
    'bg-space-800', 'bg-space-900', 'bg-space-950',
    'border-space-500', 'border-space-600', 'border-space-700',
    // Hull (text/neutrals)
    'text-hull-100', 'text-hull-200', 'text-hull-300', 'text-hull-400', 'text-hull-500',
    // Primary (orange)
    'bg-primary-500', 'bg-primary-600', 'text-primary-400', 'text-primary-500',
    'from-primary-400', 'from-primary-500', 'to-primary-500', 'to-primary-600',
    'border-primary-500',
    // Data (cyan)
    'text-data-400', 'text-data-500', 'bg-data-500',
    'from-data-400', 'from-data-500', 'to-data-500', 'to-data-600',
    // Tactical (green)
    'text-tactical-400', 'text-tactical-500', 'bg-tactical-400', 'bg-tactical-500',
    // Danger (red)
    'text-danger-400', 'text-danger-500', 'bg-danger-500', 'bg-danger-600',
    'from-danger-400', 'from-danger-500', 'to-danger-500', 'to-danger-600',
    // Custom shadows
    'shadow-btn', 'shadow-btn-hover', 'shadow-panel', 'shadow-panel-hover',
    'shadow-glow-primary', 'shadow-glow-data', 'shadow-glow-danger',
    // Custom radius
    'rounded-tactical', 'rounded-panel', 'rounded-badge',
  ],
  theme: {
    extend: {
      // Color Palette: "Subtle Galactic Tactical"
      colors: {
        // Primary: "Squadron Orange" - Rebel Alliance warning lights
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main brand color
          600: '#ea580c', // Hover states
          700: '#c2410c', // Active/pressed
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Secondary: "Deep Space" - Starship interior charcoal blues
        space: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Primary background
          900: '#0f172a', // Deep backgrounds, sidebars
          950: '#020617', // Modal overlays
        },
        // Accent: "Data Cyan" - Holographic display readouts
        data: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee', // Highlight glow, links
          500: '#06b6d4', // Secondary buttons, info states
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Success: "Tactical Green" - Sensor lock-on, confirmations
        tactical: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80', // Online indicators
          500: '#22c55e', // Success messages
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Danger: Alert red for errors/warnings
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Neutrals: "Hull Gray" - Warm grays (stone palette)
        hull: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1', // Borders, dividers
          400: '#a8a29e',
          500: '#78716c', // Secondary text
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917', // Primary text (dark mode)
          950: '#0c0a09',
        },
      },
      // Typography
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      // Border Radius: "Micro-radii" - Engineered precision
      borderRadius: {
        'tactical': '4px', // Buttons, inputs
        'panel': '6px', // Cards, panels
        'badge': '3px', // Badges, tags
      },
      // Box Shadows
      boxShadow: {
        // Button shadows
        'btn': '0 1px 2px 0 rgb(0 0 0 / 0.15)',
        'btn-hover': '0 2px 4px 0 rgb(0 0 0 / 0.2)',
        // Top-light border effect (inset)
        'toplight': 'inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
        // Panel shadows
        'panel': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        'panel-hover': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        // Glow effects
        'glow-primary': '0 0 0 3px rgb(249 115 22 / 0.3)',
        'glow-data': '0 0 0 3px rgb(6 182 212 / 0.3)',
        'glow-tactical': '0 0 0 3px rgb(34 197 94 / 0.3)',
        'glow-danger': '0 0 0 3px rgb(239 68 68 / 0.3)',
      },
      // Animations
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'lock-on': 'lock-on 150ms ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'lock-on': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Transition timing
      transitionTimingFunction: {
        'tactical': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
