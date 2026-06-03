# Premium Redesign Resources

This project has been safely prepped for a future premium redesign. No existing layouts, navigation, or working screens were touched, keeping the app 100% runnable in Expo Go.

## 1. Design Tokens
The new design tokens are located in the `/theme/` directory (separate from `src/theme/` to avoid breaking current code). 
- `theme/colors.ts`: Dark, light, and category specific hex codes.
- `theme/typography.ts`: Definitions for Fraunces (Display) and Space Grotesk (Body) with a full sizing scale.
- `theme/spacing.ts`: Layout and spacing scales.
- `theme/radius.ts`: Border radiuses.
- `theme/shadows.ts`: Reusable shadows/elevations.

## 2. Lottie Animations
The folder `assets/animations/` has been created. A placeholder `README.md` is inside detailing the exact filenames expected for future Lottie JSON files (e.g., `celebration.json`, `onboarding-hero.json`).

## 3. Reusable Helpers
Isolated utility components and helpers have been added to `/src/helpers/`:
- `AppText.tsx`: A theme-aware wrapper for `Text`.
- `AppIcon.tsx`: A placeholder wrapper for `phosphor-react-native`.
- `haptics.ts`: Easy helper functions using `expo-haptics`.
- `gradient.tsx`: A wrapper for `expo-linear-gradient`.
- `categoryIcons.ts`: Constants mapping categories to icons.

## 4. Dependencies & Config
- All required Expo-compatible packages (`expo-haptics`, `lottie-react-native`, `react-native-reanimated`, `expo-blur`, etc.) are installed.
- `babel.config.js` was updated to include the `react-native-reanimated/plugin` at the very end.

## Intentionally NOT Changed
- Existing screens (`src/screens/`) were completely untouched.
- Existing central theme context (`src/theme/ThemeContext.tsx`) was not deeply modified to prevent breaking the current prototype.
- Current styling, navigation, and visual layouts remain exactly as they were.
