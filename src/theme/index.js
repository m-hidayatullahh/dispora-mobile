// Satu-satunya sumber warna aplikasi.
// Kalau mau menyamakan lebih presisi dengan web, cukup ubah nilai di file ini.

export const colors = {
  // Dasar gelap seperti tampilan web Dispora
  base: '#0B0C10',
  surface: '#141620',
  surfaceAlt: '#1C1F2B',
  line: '#272B3A',

  // Merah DISPORA (aksen utama)
  primary: '#D51C29',
  primaryDark: '#A31220',
  primarySoft: 'rgba(213, 28, 41, 0.14)',

  // Kuning-emas Jaya Raya (aksen sekunder)
  gold: '#F2B705',
  goldSoft: 'rgba(242, 183, 5, 0.14)',

  // Biru Jaya Raya (aksen pendukung)
  blue: '#1D4ED8',
  blueSoft: 'rgba(29, 78, 216, 0.16)',

  // Teks
  text: '#FFFFFF',
  textMuted: '#A3A8B8',
  textFaint: '#6C7183',

  success: '#22C55E',
  overlay: 'rgba(11, 12, 16, 0.72)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const type = {
  display: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: colors.text,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    color: colors.textMuted,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: colors.textFaint,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.gold,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export default { colors, spacing, radius, type, shadow };
