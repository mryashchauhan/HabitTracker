// Typography system using Fraunces (display) + Space Grotesk (body)
export const Typography = {
  // Font families
  fontFamily: {
    // Display — only for greeting, screen titles, onboarding headlines, habit detail name
    display: 'Fraunces_700Bold',
    displaySemi: 'Fraunces_600SemiBold',
    // Body — all other text
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    semiBold: 'SpaceGrotesk_600SemiBold',
    // Aliases for backwards compatibility in components
    bold: 'Fraunces_700Bold',
  },

  // Font sizes (px) — minimum 11px
  size: {
    // Named sizes used across screens
    hero: 34,
    title: 28,
    sectionHeading: 20,
    cardTitle: 16,
    body: 15,
    small: 13,
    label: 11,
    caption: 10,
    // Legacy aliases (used in original screens, kept for compatibility)
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // Letter spacing
  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.2,
    section: 2,    // For uppercase section labels
  },
};

// Section label style — uppercase tracked SpaceGrotesk 11px
export const SectionLabelStyle = {
  fontFamily: Typography.fontFamily.semiBold,
  fontSize: Typography.size.label,
  letterSpacing: Typography.tracking.section,
  textTransform: 'uppercase' as const,
};
