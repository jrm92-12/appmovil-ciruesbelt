import { Platform } from 'react-native';

const tintColorLight = '#d45d8c';
const tintColorDark = '#ffb6d1';

export const Colors = {
  light: {
    text: '#4d2940',
    background: '#fff3f8',
    tint: tintColorLight,
    icon: '#a06781',
    tabIconDefault: '#c18aa3',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffeaf3',
    background: '#2f1624',
    tint: tintColorDark,
    icon: '#f0bfd3',
    tabIconDefault: '#d39bb5',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});