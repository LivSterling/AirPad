/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}', // Include lib for any UI utilities
  ],
  theme: {
    extend: {
      // Custom color palette for AirPad
      colors: {
        // Pad states
        'pad-active': '#3B82F6',      // Blue 500
        'pad-hover': '#60A5FA',       // Blue 400
        'pad-inactive': '#1F2937',    // Gray 800
        'pad-triggered': '#8B5CF6',   // Violet 500
        
        // Recording/Playback states
        'recording': '#EF4444',       // Red 500
        'playing': '#10B981',         // Green 500
        'paused': '#F59E0B',          // Amber 500
        
        // Kit types
        'kit-drums': '#EC4899',       // Pink 500
        'kit-piano': '#8B5CF6',       // Violet 500
        'kit-synth': '#06B6D4',       // Cyan 500
        
        // UI elements
        'overlay-bg': 'rgba(0, 0, 0, 0.85)',
        'glass-bg': 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
      },
      
      // Animations for visual feedback
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-subtle': 'bounce 1s infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      
      // Keyframes for custom animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      
      // Grid layouts
      gridTemplateColumns: {
        '3': 'repeat(3, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '3': 'repeat(3, minmax(0, 1fr))',
      },
      
      // Custom spacing for pads and layout
      spacing: {
        'pad': '120px',
        'pad-gap': '16px',
        'control-panel': '200px',
      },
      
      // Aspect ratios for pads
      aspectRatio: {
        'square': '1 / 1',
      },
      
      // Border radius
      borderRadius: {
        'pad': '12px',
        'control': '8px',
      },
      
      // Box shadows for depth
      boxShadow: {
        'pad': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'pad-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'pad-active': '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
      
      // Backdrop blur for glass morphism
      backdropBlur: {
        'xs': '2px',
      },
      
      // Typography
      fontSize: {
        'pad-label': ['0.875rem', { lineHeight: '1.25rem' }],
        'status': ['0.75rem', { lineHeight: '1rem' }],
      },
      
      // Z-index layers
      zIndex: {
        'overlay': '50',
        'modal': '100',
        'tooltip': '200',
      },
      
      // Transitions
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      
      // Screen breakpoints (optional, for responsive design)
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
  
  // Safelist classes that might be generated dynamically
  safelist: [
    'bg-kit-drums',
    'bg-kit-piano',
    'bg-kit-synth',
    'text-kit-drums',
    'text-kit-piano',
    'text-kit-synth',
    'shadow-glow-blue',
    'shadow-glow-green',
    'shadow-glow-red',
  ],
}
