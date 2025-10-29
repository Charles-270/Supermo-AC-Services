/**
 * Design System Type Definitions
 * Core interfaces and types for the UI/UX redesign
 */

// Color System Types
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
}

// Typography System Types
export interface TypographyScale {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: [string, { lineHeight: string; letterSpacing: string }];
    sm: [string, { lineHeight: string; letterSpacing: string }];
    base: [string, { lineHeight: string; letterSpacing: string }];
    lg: [string, { lineHeight: string; letterSpacing: string }];
    xl: [string, { lineHeight: string; letterSpacing: string }];
    '2xl': [string, { lineHeight: string; letterSpacing: string }];
    '3xl': [string, { lineHeight: string; letterSpacing: string }];
    '4xl': [string, { lineHeight: string; letterSpacing: string }];
    '5xl': [string, { lineHeight: string; letterSpacing: string }];
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

// Spacing System Types
export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

// Shadow System Types
export interface ShadowScale {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// Border Radius Types
export interface RadiusScale {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// Core Design Tokens Interface
export interface DesignTokens {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  shadows: ShadowScale;
  borderRadius: RadiusScale;
}

// Component Size Types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Component Variant Types
export type ComponentVariant = 
  | 'default'
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'destructive'
  | 'success'
  | 'warning';

// Component State Types
export interface ComponentState {
  isLoading: boolean;
  isDisabled: boolean;
  variant: ComponentVariant;
  size: ComponentSize;
  error?: string;
}

export interface InteractionState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
  isSelected: boolean;
}

// Base Component Interface
export interface ComponentBase {
  className?: string;
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

// Theme Configuration Types
export interface ThemeConfig {
  id: string;
  name: string;
  colors: ColorPalette;
  typography: TypographyScale;
  components: ComponentTheme;
  darkMode: boolean;
}

export interface ComponentTheme {
  button: ButtonTheme;
  input: InputTheme;
  card: CardTheme;
  modal: ModalTheme;
}

export interface ButtonTheme {
  variants: Record<ComponentVariant, string>;
  sizes: Record<ComponentSize, string>;
  defaultProps: {
    variant: ComponentVariant;
    size: ComponentSize;
  };
}

export interface InputTheme {
  variants: Record<'default' | 'error' | 'success', string>;
  sizes: Record<ComponentSize, string>;
  defaultProps: {
    variant: 'default' | 'error' | 'success';
    size: ComponentSize;
  };
}

export interface CardTheme {
  variants: Record<'default' | 'elevated' | 'outlined', string>;
  defaultProps: {
    variant: 'default' | 'elevated' | 'outlined';
  };
}

export interface ModalTheme {
  sizes: Record<ComponentSize, string>;
  defaultProps: {
    size: ComponentSize;
  };
}

// Layout Types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface LayoutConfig {
  type: 'grid' | 'flex' | 'masonry';
  columns: number;
  gap: string;
  responsive: boolean;
}

// Dashboard Widget Types
export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'progress'
  | 'status';

export interface WidgetData {
  title: string;
  value?: string | number;
  data?: any[];
  config?: Record<string, any>;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: Position;
  size: Size;
  data: WidgetData;
}

export interface DashboardState {
  layout: LayoutConfig;
  widgets: WidgetConfig[];
  filters: FilterState;
  preferences: UserPreferences;
}

export interface FilterState {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  category?: string[];
  search?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface TransitionConfig {
  enter: AnimationConfig;
  exit: AnimationConfig;
}

// Responsive Breakpoint Types
export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Accessibility Types
export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}