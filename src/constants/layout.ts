import { Platform } from 'react-native';

export const FLOATING_NAV_HEIGHT = Platform.OS === 'android' ? 90 : 100;

/**
 * Max width of the main content column. On phones (< 640dp wide) this has no effect;
 * on tablets (e.g. OnePlus Pad 2, ~880dp wide in portrait) content stays a readable,
 * centred column instead of stretching edge to edge.
 */
export const MAX_CONTENT_WIDTH = 640;

/** Spread onto a screen's SafeAreaView style to centre it as a capped column. */
export const CONTENT_COLUMN = {
  width: '100%',
  maxWidth: MAX_CONTENT_WIDTH,
  alignSelf: 'center',
} as const;
