import { createContext } from '@lit/context';
import type { OoaThemeName } from '@ooa/tokens';

export type OoaDirection = 'ltr' | 'rtl';
export type OoaSize = 'small' | 'middle' | 'large';

export interface OoaConfig {
  theme: OoaThemeName;
  locale: string;
  direction: OoaDirection;
  componentSize: OoaSize;
  disabled: boolean;
}

export const defaultOoaConfig: OoaConfig = {
  theme: 'light',
  locale: 'en-US',
  direction: 'ltr',
  componentSize: 'middle',
  disabled: false,
};

export const ooaConfigContext = createContext<OoaConfig>('ooa-config');
