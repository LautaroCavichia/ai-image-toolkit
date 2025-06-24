// Global Theme Configuration - Deep Blues Professional Palette
export const theme = {
  colors: {
    // Primary palette - Deep Navy Blue
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9', 
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Main primary - Slate
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Secondary palette - Professional Blue
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main secondary - Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Accent palette - Ocean Blue
    accent: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main accent - Sky Blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    
    // Tertiary palette - Cool Gray
    tertiary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Success - Emerald (complements blue)
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    
    // Warning - Amber (warm contrast)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    
    // Error - Rose (softer red for blue palette)
    error: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
    
    // Neutral grays (blue-tinted)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Glass colors for glassmorphism
    glass: {
      white: 'rgba(255, 255, 255, 0.4)',
      'white-light': 'rgba(255, 255, 255, 0.2)',
      'white-strong': 'rgba(255, 255, 255, 0.6)',
      blue: 'rgba(59, 130, 246, 0.1)',
      'blue-light': 'rgba(59, 130, 246, 0.05)',
      'blue-strong': 'rgba(59, 130, 246, 0.15)',
      navy: 'rgba(30, 41, 59, 0.1)',
      'navy-light': 'rgba(30, 41, 59, 0.05)',
      'navy-strong': 'rgba(30, 41, 59, 0.2)',
      ocean: 'rgba(14, 165, 233, 0.08)',
      'ocean-light': 'rgba(14, 165, 233, 0.04)',
      'ocean-strong': 'rgba(14, 165, 233, 0.12)',
      dark: 'rgba(15, 23, 42, 0.2)',
      'dark-light': 'rgba(15, 23, 42, 0.1)',
      'dark-strong': 'rgba(15, 23, 42, 0.3)',
    },
    
    // Gradient definitions - Subtle Blues
    gradients: {
      primary: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #0ea5e9 100%)',
      'primary-light': 'linear-gradient(135deg, #cbd5e1 0%, #93c5fd 50%, #7dd3fc 100%)',
      'primary-reverse': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #1e293b 100%)',
      hero: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f0f9ff 100%)',
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)',
      subtle: 'linear-gradient(135deg, #64748b 0%, #3b82f6 100%)',
    }
  },
  
  // Spacing scale
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border radius
  radius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  
  // Shadows with cool blue tints
  shadows: {
    sm: '0 1px 2px 0 rgba(30, 41, 59, 0.05)',
    md: '0 4px 6px -1px rgba(30, 41, 59, 0.08), 0 2px 4px -2px rgba(59, 130, 246, 0.04)',
    lg: '0 10px 15px -3px rgba(30, 41, 59, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.05)',
    xl: '0 20px 25px -5px rgba(30, 41, 59, 0.12), 0 8px 10px -6px rgba(14, 165, 233, 0.08)',
    '2xl': '0 25px 50px -12px rgba(30, 41, 59, 0.15)',
    glass: '0 8px 32px 0 rgba(59, 130, 246, 0.12)',
    'glass-lg': '0 25px 45px 0 rgba(30, 41, 59, 0.15)',
    'glass-blue': '0 20px 40px 0 rgba(14, 165, 233, 0.2)',
  },
  
  // Glassmorphism effects
  glass: {
    backdrop: 'blur(20px)',
    'backdrop-sm': 'blur(12px)',
    'backdrop-lg': 'blur(32px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    'border-strong': '1px solid rgba(255, 255, 255, 0.4)',
    gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
    'gradient-navy': 'linear-gradient(135deg, rgba(30, 41, 59, 0.08), rgba(30, 41, 59, 0))',
    'gradient-blue': 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0))',
    'gradient-ocean': 'linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(14, 165, 233, 0)),'
  },
  
  // Animation timing
  animation: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    'extra-slow': '700ms',
  },
  
  // Typography
  typography: {
    fontFamily: {
      brand: "'AwareBold', sans-serif", // Only for 'Pixel Perfect AI'
      title: "'Poppins', sans-serif", // Modern, clean headings
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      accent: "'Playfair Display', serif", // Elegant accent font
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    }
  }
} as const;

// Utility functions
export const getThemeColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let result: any = theme.colors;
  
  for (const key of path) {
    result = result[key];
    if (result === undefined) return undefined;
  }
  
  return result;
};

export type ThemeColors = typeof theme.colors;
export type ColorKey = keyof ThemeColors;