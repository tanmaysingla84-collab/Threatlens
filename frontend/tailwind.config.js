/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Design Tokens ─────────────────────────────────────────────────────
      colors: {
        // Backgrounds
        bg: {
          primary:   '#0a0a0f',
          secondary: '#0f0f18',
          tertiary:  '#13131f',
          card:      'rgba(255, 255, 255, 0.03)',
          cardHover: 'rgba(255, 255, 255, 0.06)',
        },
        // Accent palette — deep blue → purple gradient family
        accent: {
          blue:       '#3b82f6',
          blueDark:   '#1d4ed8',
          purple:     '#8b5cf6',
          purpleDark: '#6d28d9',
          cyan:       '#06b6d4',
          indigo:     '#6366f1',
        },
        // Threat band colors
        threat: {
          safe:   '#22c55e',   // green-500
          low:    '#eab308',   // yellow-500
          medium: '#f97316',   // orange-500
          high:   '#ef4444',   // red-500
        },
        // Border / separator
        border: {
          subtle:  'rgba(255, 255, 255, 0.06)',
          default: 'rgba(255, 255, 255, 0.10)',
          accent:  'rgba(99, 102, 241, 0.40)',
        },
        // Text hierarchy
        text: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          tertiary:  '#64748b',
          muted:     '#475569',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Menlo', 'monospace'],
      },

      // ─── Spacing Scale ─────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // ─── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        'card': '16px',
        'xl2': '20px',
      },

      // ─── Box Shadows (glow effects) ────────────────────────────────────────
      boxShadow: {
        'card':       '0 4px 24px rgba(0, 0, 0, 0.40)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.60)',
        'glow-blue':  '0 0 20px rgba(59, 130, 246, 0.25)',
        'glow-purple':'0 0 20px rgba(139, 92, 246, 0.25)',
        'glow-safe':  '0 0 16px rgba(34, 197, 94, 0.30)',
        'glow-high':  '0 0 16px rgba(239, 68, 68, 0.30)',
        'glow-medium':'0 0 16px rgba(249, 115, 22, 0.30)',
        'glow-low':   '0 0 16px rgba(234, 179, 8, 0.30)',
      },

      // ─── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ─── Background Images ─────────────────────────────────────────────────
      backgroundImage: {
        'gradient-primary':   'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-dark':      'linear-gradient(180deg, #0a0a0f 0%, #0f0f18 100%)',
        'gradient-card':      'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        'gradient-safe':      'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
        'gradient-high':      'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
        'gradient-medium':    'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
        'gradient-low':       'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.05) 100%)',
      },

      // ─── Animation ─────────────────────────────────────────────────────────
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
