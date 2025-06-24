// Core styles
import './styles/variables.css';

// Components
export { Button } from './components/Button/Button';
export type { ButtonProps } from './components/Button/Button';

export { Typography } from './components/Typography/Typography';
export type { TypographyProps } from './components/Typography/Typography';

export { Navbar } from './components/Navbar/Navbar';
export type { NavbarProps, NavItem } from './components/Navbar/Navbar';

export { AnimatedBackground } from './components/AnimatedBackground/AnimatedBackground';

export { GlitchLogo } from './components/GlitchLogo/GlitchLogo';
export type { GlitchLogoProps } from './components/GlitchLogo/GlitchLogo';

export { PixelPerfectLogo } from './components/PixelPerfectLogo/PixelPerfectLogo';
export type { PixelPerfectLogoProps } from './components/PixelPerfectLogo/PixelPerfectLogo';

export { ProductCard } from './components/ProductCard/ProductCard';
export type { ProductCardProps } from './components/ProductCard/ProductCard';

export { Reviews } from './components/Reviews/Reviews';
export type { ReviewsProps } from './components/Reviews/Reviews';

export { Footer } from './components/Footer/Footer';
export type { FooterProps } from './components/Footer/Footer';

// Layouts
export { HomepageLayout, Section, Container, Grid } from './layouts/HomepageLayout/HomepageLayout';
export type { HomepageLayoutProps, SectionProps } from './layouts/HomepageLayout/HomepageLayout';

// Types
export interface ZondaTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  glass: string;
}

export interface ZondaUIConfig {
  theme?: 'dark' | 'light' | 'purple' | 'custom';
  customTheme?: Partial<ZondaTheme>;
  enableAnimations?: boolean;
  enableGlassEffects?: boolean;
}