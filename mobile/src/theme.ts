export const colors = {
  primary: '#1F2A60',
  accent: '#E85C5C',
  bg: '#FFFFFF',
  surface: '#F4F6FB',
  border: '#D9DEEA',
  text: '#1A1A1A',
  muted: '#5B6275',
  success: '#1E7B4F',
  successBg: '#E6F4EC',
  error: '#B3261E',
  errorBg: '#FCEBEA',
  white: '#FFFFFF',
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

// Telugu and Devanagari need generous line height so marks are not clipped.
export const type = {
  title: { fontSize: 24, lineHeight: 34, fontWeight: '700' as const, color: colors.text },
  heading: { fontSize: 20, lineHeight: 30, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 17, lineHeight: 27, color: colors.text },
  small: { fontSize: 14, lineHeight: 22, color: colors.muted },
  german: { fontSize: 30, lineHeight: 40, fontWeight: '700' as const, color: colors.primary },
};
