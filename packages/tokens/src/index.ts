export type OoaThemeName = 'light' | 'dark';

export interface OoaThemeTokens {
  colorPrimary: string;
  colorText: string;
  colorTextSecondary: string;
  colorBgContainer: string;
  colorBorder: string;
  colorError: string;
  borderRadius: string;
  controlHeight: string;
}

export const lightTheme: OoaThemeTokens = {
  colorPrimary: '#1677ff',
  colorText: 'rgba(0, 0, 0, 0.88)',
  colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
  colorBgContainer: '#ffffff',
  colorBorder: '#d9d9d9',
  colorError: '#ff4d4f',
  borderRadius: '6px',
  controlHeight: '32px',
};

export const darkTheme: OoaThemeTokens = {
  ...lightTheme,
  colorText: 'rgba(255, 255, 255, 0.85)',
  colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
  colorBgContainer: '#141414',
  colorBorder: '#424242',
};

export function themeToCssVariables(tokens: OoaThemeTokens): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [`--ooa-${name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`, value]),
  );
}
