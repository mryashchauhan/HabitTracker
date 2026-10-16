// Typography system
// Primary: Plus Jakarta Sans (Behance reference font — modern, geometric, high-contrast)
// Display: Fraunces (HabitDetail headline only)
// Legacy: SpaceGrotesk (retained for backwards compatibility)

export const Typography = {
  fontFamily: {
    // ── Plus Jakarta Sans — Behance's stated typeface ──────────────────
    // H1 (Screen titles): SemiBold 24px / 120% line-height
    // H2 (Section titles): SemiBold 20px / 130% line-height
    // H3 (Card titles): Medium 18px / 140% line-height
    // H4 (Subtext/labels): Regular 16px / 150% line-height
    regular:  'PlusJakartaSans_400Regular',
    medium:   'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
    bold:     'PlusJakartaSans_700Bold',

    // ── Display — habit detail screen headline only ──────────────────────
    display: 'Fraunces_700Bold',
    displaySemi: 'Fraunces_600SemiBold',

    // ── Legacy aliases — kept for any leftover SpaceGrotesk usage ────────
    legacyRegular:  'SpaceGrotesk_400Regular',
    legacyMedium:   'SpaceGrotesk_500Medium',
    legacySemiBold: 'SpaceGrotesk_600SemiBold',
  },

  // Font sizes (px) — refined Behance spec
  size: {
    hero:           32,   // Large headings
    title:          24,   // H1 — Screen titles (SemiBold)
    sectionHeading: 20,   // H2 — Section headers (SemiBold)
    cardTitle:      18,   // H3 — Card titles (Medium)
    body:           16,   // H4 / Body text (Regular)
    small:          14,   // Helper text
    label:          12,   // Labels, badges
    caption:        11,   // Ultra-small captions
    // Legacy aliases (kept for existing screens)
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
  },

  // Line heights — Behance spec
  lineHeight: {
    tight:   1.2,   // H1 (120%)
    snug:    1.3,   // H2 (130%)
    normal:  1.4,   // H3 (140%)
    relaxed: 1.5,   // H4 / Body (150%)
    loose:   1.7,
  },

  // Letter spacing
  tracking: {
    tight:   -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1.2,
    section: 2,
  },
};

// Section label style — Plus Jakarta Sans SemiBold 12px uppercase
export const SectionLabelStyle = {
  fontFamily: Typography.fontFamily.semiBold,
  fontSize: Typography.size.label,
  letterSpacing: Typography.tracking.section,
  textTransform: 'uppercase' as const,
};
