// src/constants/theme.ts
export const theme = {
    colors: {
      // Primary dark background (io.net inspired)
      background: {
        primary: '#05050e',
        secondary: '#0a0a15',
        tertiary: '#0f0f1a',
        card: '#151520',
        elevated: '#1a1a28'
      },
      
      // Text colors
      text: {
        primary: '#ffffff',
        secondary: '#a8a8b3',
        muted: '#707085',
        accent: '#8b5cf6'
      },
      
      // Accent colors (purple/blue theme)
      accent: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        tertiary: '#6d28d9',
        light: '#a78bfa',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)'
      },
      
      // Status colors
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      
      // Border colors
      border: {
        primary: '#2a2a3a',
        secondary: '#3a3a4a',
        accent: '#8b5cf6'
      }
    },
    
    typography: {
      fontFamily: {
        primary: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace"
      },
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem'
      },
      
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      
      lineHeight: {
        tight: 1.1,
        normal: 1.4,
        relaxed: 1.6,
        loose: 1.8
      }
    },
    
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
      '5xl': '8rem',
      '6xl': '12rem'
    },
    
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    },
    
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
      glowLg: '0 0 40px rgba(139, 92, 246, 0.2)'
    },
    
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out'
    },
    
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modal: 1040,
      popover: 1050,
      tooltip: 1060
    }
  } as const;
  
  export type Theme = typeof theme;