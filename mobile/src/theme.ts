// Palette: block-print blue (primary), marigold (audio, progress), brass (borders, labels).
export const colors = {
  primary: '#1F4A75',
  primarySoft: '#2E5D8C',
  primaryTint: '#C9D6E4',
  accent: '#F28C00',
  accentText: '#A85F00', // marigold is too light for text on white
  onAccent: '#2B1A00',
  brass: '#B59A6D',
  brassText: '#8C7550',
  brassLight: '#D8C49A',
  bg: '#FFFFFF',
  surface: '#FBF8F2',
  border: '#E6DCC8',
  text: '#1A1A1A',
  muted: '#5B6275',
  success: '#1E7B4F',
  successBg: '#E6F4EC',
  error: '#B3261E',
  errorBg: '#FCEBEA',
  white: '#FFFFFF',
  gold: '#FFF4D6', // German answer bubbles in the tutor
  goldBorder: '#E8B64C',
  locked: '#9AA1B2',
};

// Headings use Fraunces (OFL), loaded in app/_layout.tsx; body text uses the system font.
export const fonts = { serif: 'Fraunces_700Bold', serifMedium: 'Fraunces_600SemiBold' };

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

// Telugu and Devanagari need generous line height so marks are not clipped.
export const type = {
  title: { fontSize: 26, lineHeight: 36, fontFamily: fonts.serif, color: colors.text },
  heading: { fontSize: 20, lineHeight: 30, fontFamily: fonts.serifMedium, color: colors.text },
  body: { fontSize: 17, lineHeight: 27, color: colors.text },
  small: { fontSize: 14, lineHeight: 22, color: colors.muted },
  german: { fontSize: 30, lineHeight: 40, fontWeight: '700' as const, color: colors.primary },
};
