import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#0a2a6c',
          accent:  '#C9A227',
          vivid:   '#0123D4',
        },
        neutral: {
          900: '#1A2530',
          700: '#4A5D6E',
          500: '#7A8FA3',
          300: '#C4CDD8',
          200: '#DCE3EC',
          100: '#EEF1F6',
          50:  '#F4F6FA',
        },
        status: {
          review:   '#f5a623',
          quoted:   '#1f8a4c',
          bound:    '#2563eb',
          declined: '#b91c1c',
        },
        priority: {
          critical: '#b91c1c',
          high:     '#ea580c',
          medium:   '#f59e0b',
          low:      '#6b7280',
        },
        surface: {
          page:    '#EEF1F6',
          card:    '#ffffff',
          input:   '#F4F6FA',
          divider: '#DCE3EC',
          border:  '#C4CDD8',
        },
        form: {
          label:   '#7A8FA3',
          heading: '#1A2530',
        },
        semantic: {
          avatarGreen:     '#1A7A4A',
          notificationRed: '#B91C1C',
        },
        kpi: {
          trendPositive: '#2E7D32',
          iconBound:     '#005B99',
        },
      },
      backgroundImage: {
        'brand-panel': 'linear-gradient(160deg, #010F78 8.49%, #0118A0 45.85%, #0123D4 91.51%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
