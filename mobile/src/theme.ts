// Palette matches the reference site: navy actions, slate accents, warm off-white page.
export const colors = {
  primary: '#0F2750', // navy: headings, primary buttons, brand
  primarySoft: '#596475', // slate: secondary text and accents
  primaryTint: '#E0DED7', // light warm grey for subtle fills
  accent: '#596475', // audio and progress
  accentText: '#0F2750',
  onAccent: '#FDFCF8',
  brass: '#E0DED7',
  brassText: '#596475',
  brassLight: '#E0DED7',
  bg: '#FEFDFB',
  surface: '#FFFFFF',
  border: '#E0DED7',
  text: '#0C1A32',
  muted: '#596475',
  success: '#1E7B4F',
  successBg: '#E6F4EC',
  error: '#B3261E',
  errorBg: '#FCEBEA',
  white: '#FFFFFF',
  gold: '#F4F1EA', // tutor German bubbles
  goldBorder: '#E0DED7',
  locked: '#9AA1B2',
};

// Headings use Fraunces, body text uses Inter (both OFL), loaded in app/_layout.tsx.
export const fonts = { serif: 'Fraunces_700Bold', serifMedium: 'Fraunces_600SemiBold', body: 'Inter_400Regular', bodyBold: 'Inter_700Bold' };

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

// Telugu and Devanagari need generous line height so marks are not clipped.
export const type = {
  title: { fontSize: 26, lineHeight: 36, fontFamily: fonts.serif, color: colors.text },
  heading: { fontSize: 20, lineHeight: 30, fontFamily: fonts.serifMedium, color: colors.text },
  body: { fontSize: 17, lineHeight: 27, color: colors.text, fontFamily: fonts.body },
  small: { fontSize: 14, lineHeight: 22, color: colors.muted, fontFamily: fonts.body },
  german: { fontSize: 30, lineHeight: 40, fontFamily: fonts.bodyBold, color: colors.primary },
};
