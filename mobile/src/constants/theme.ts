export const colors = {
  // Fondo
  bg: '#eef7fb',
  bg2: '#f7fbfd',
  card: '#ffffff',
  cardTranslucent: 'rgba(255,255,255,0.92)',

  // Texto
  text: '#0f2742',
  muted: '#64758b',

  // Primario / Acento
  primary: '#0e8fb3',
  primaryDark: '#086884',
  accent: '#22c58b',

  // Estados
  danger: '#e04f5f',
  warning: '#bd7a02',

  // Bordes y separadores
  border: '#d8e7ee',

  // Inputs
  inputBg: '#fbfdfe',
  inputBorder: '#d8e7ee',

  // Alertas
  alertErrorBg: '#fff1f2',
  alertErrorText: '#b42332',
  alertErrorBorder: '#ffc9d0',
  alertSuccessBg: '#ecfdf5',
  alertSuccessText: '#087443',
  alertSuccessBorder: '#b9f1d4',
  alertInfoBg: '#eff8ff',
  alertInfoText: '#155b75',
  alertInfoBorder: '#c7ebf7',

  // Status pills
  statusDefaultBg: '#edf8fc',
  statusDefaultText: '#086884',
  statusCancelBg: '#fff1f2',
  statusCancelText: '#e04f5f',
  statusDoneBg: '#ecfdf5',
  statusDoneText: '#087443',
  statusFinalBg: '#eef2ff',
  statusFinalText: '#3f3cbb',
  statusProgressBg: '#fff7ed',
  statusProgressText: '#c2410c',

  // Botones
  secondaryBg: '#e8f8fc',
  secondaryBorder: '#bfe8f2',
  ghostBg: '#f2f7fa',
  ghostDangerBg: '#fff4f5',
  ghostDangerBorder: '#ffd3d8',
  iconLinkBg: '#ebf7fb',
  iconLinkBorder: '#c5eaf3',
  logoutBg: '#fff2f3',

  // Nav activo / chips
  navActiveBg: '#eaf7fb',
  chipBg: '#eaf7fb',
  chipBorder: '#c7ebf7',

  // Stats
  statIconBg: '#e8f8fc',

  // Hero
  heroPatientStart: '#0e8fb3',
  heroPatientEnd: '#0a5c7a',
  heroDoctorStart: '#0d7d7a',
  heroDoctorEnd: '#0e5870',
  heroAdminStart: '#1e567e',
  heroAdminEnd: '#0a2e49',

  // Auth brand panel
  authGradientStart: '#0e7394',
  authGradientMid: '#0d91b5',
  authGradientEnd: '#20c58e',

  // Primary button gradient
  btnGradientStart: '#0e8fb3',
  btnGradientEnd: '#086884',

  // Tag / chips gradient (icon)
  tagGradientStart: '#0e8fb3',
  tagGradientEnd: '#22c58b',

  // Success summary
  successSummaryStart: '#ecfdf5',
  successSummaryEnd: '#f7fffb',

  // Helper / info cards
  helperBg: '#f4fbfd',
  helperBorder: '#cfeef6',
  helperText: '#416176',

  // Blancos / opacidades
  white: '#ffffff',
  white10: 'rgba(255,255,255,0.10)',
  white12: 'rgba(255,255,255,0.12)',
  white15: 'rgba(255,255,255,0.15)',
  white18: 'rgba(255,255,255,0.18)',
  white30: 'rgba(255,255,255,0.30)',
};

export const typography = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, monospace',

  sizes: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 25,
    xxxl: 34,
    huge: 42,
  },

  weights: {
    normal: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 34,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 34,
};

export const shadows = {
  card: {
    shadowColor: '#0f2742',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 8,
  },
  button: {
    shadowColor: '#0e8fb3',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 6,
  },
  statCard: {
    shadowColor: '#0f2742',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
};

export const gradients = {
  authBrand: ['#0e7394', '#0d91b5', '#20c58e'] as const,
  primaryButton: ['#0e8fb3', '#086884'] as const,
  heroPatient: ['#0e8fb3', '#0a5c7a'] as const,
  heroDoctor: ['#0d7d7a', '#0e5870'] as const,
  heroAdmin: ['#1e567e', '#0a2e49'] as const,
  iconTag: ['#0e8fb3', '#22c58b'] as const,
};