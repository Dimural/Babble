import { Platform } from 'react-native';

export const babbleColors = {
  background: '#fdf6f0',
  card: '#ffffff',
  text: '#2f2623',
  muted: '#7f6c66',
  primary: '#f4b6a6',
  primaryText: '#4a2c23',
  secondary: '#b9e0e2',
  secondaryText: '#24474a',
  outline: '#f0d7cd',
  chip: '#f7e7c9',
  inputBackground: '#fffaf6',
  inputBorder: '#f0d7cd',
  accent: '#f9d8c7',
  shadow: '#dcc9bf',
  status: '#8b4a3d',
  placeholder: '#b8a6a1',
};

export const babbleTypography = {
  brand: Platform.select({
    ios: 'Cochin',
    android: 'serif',
    default: 'serif',
  }),
  heading: Platform.select({
    ios: 'Avenir Next',
    android: 'serif',
    default: 'serif',
  }),
  body: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

export const babbleRadii = {
  card: 24,
  pill: 18,
  input: 16,
};

export const babbleShadow = {
  shadowColor: babbleColors.shadow,
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5,
};
