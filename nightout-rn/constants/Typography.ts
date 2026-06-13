export const Fonts = {
  clashDisplay: {
    regular:    'ClashDisplay-Regular',
    medium:     'ClashDisplay-Medium',
    semibold:   'ClashDisplay-Semibold',
    bold:       'ClashDisplay-Bold',
    extrabold:  'ClashDisplay-Extrabold',
  },
  bebas:  'BebasNeue-Regular',
  inter: {
    regular: 'Inter-Regular',
    medium:  'Inter-Medium',
    semibold:'Inter-SemiBold',
    bold:    'Inter-Bold',
  },
} as const;

export const Type = {
  heroCity:    { fontFamily: Fonts.clashDisplay.extrabold, fontSize: 64, letterSpacing: -2 },
  heroTitle:   { fontFamily: Fonts.clashDisplay.bold,      fontSize: 48, letterSpacing: -1.5 },
  venueName:   { fontFamily: Fonts.clashDisplay.bold,      fontSize: 20, letterSpacing: -0.5 },
  sectionHead: { fontFamily: Fonts.clashDisplay.semibold,  fontSize: 28, letterSpacing: -1 },
  label:       { fontFamily: Fonts.bebas,                  fontSize: 13, letterSpacing: 2.5 },
  labelLg:     { fontFamily: Fonts.bebas,                  fontSize: 18, letterSpacing: 2 },
  tag:         { fontFamily: Fonts.bebas,                  fontSize: 11, letterSpacing: 2 },
  number:      { fontFamily: Fonts.bebas,                  fontSize: 32, letterSpacing: 1 },
  button:      { fontFamily: Fonts.bebas,                  fontSize: 16, letterSpacing: 3 },
  body:        { fontFamily: Fonts.inter.regular,          fontSize: 14 },
  bodyMedium:  { fontFamily: Fonts.inter.medium,           fontSize: 14 },
  caption:     { fontFamily: Fonts.inter.regular,          fontSize: 12 },
} as const;
