export type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';
export type ButtonShape = 'default' | 'circle' | 'round' | 'square';
export type ButtonHTMLType = 'submit' | 'button' | 'reset';
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type PresetColor = 'red' | 'volcano' | 'orange' | 'gold' | 'lime' | 'green' | 'cyan' | 'blue' | 'geekblue' | 'purple' | 'magenta';
export type ButtonColor = 'default' | 'primary' | 'danger' | 'link' | PresetColor;

export const BUTTON_TYPES: readonly ButtonType[] = ['default', 'primary', 'dashed', 'link', 'text'];
export const BUTTON_VARIANTS: readonly ButtonVariant[] = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'];
export const PRESET_COLORS: readonly PresetColor[] = ['red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple', 'magenta'];

const rxTwoCNChar = /^[一-龥]{2}$/;
export const isTwoCNChar = (char: string): boolean => rxTwoCNChar.test(char);

export const isUnBorderedVariant = (variant: ButtonVariant): boolean => variant === 'text' || variant === 'link';

export type ColorVariantPair = readonly [color: ButtonColor, variant: ButtonVariant];

/** 对位 antd Button.tsx 的 ButtonTypeMap：type 语法糖 → [color, variant]。 */
export const ButtonTypeMap: Readonly<Record<ButtonType, ColorVariantPair>> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  link: ['link', 'link'],
  text: ['default', 'text'],
};

export interface ResolveColorVariantInput {
  type?: ButtonType;
  color?: ButtonColor;
  variant?: ButtonVariant;
  danger?: boolean;
  ghost?: boolean;
}

/**
 * 对位 antd Button.tsx 的两个 useMemo（parsed + merged ghost 降级）。
 * 返回有效的 [color, variant] 对，danger 只作用于 color 轴。
 */
export function resolveColorVariant(input: ResolveColorVariantInput): { color: ButtonColor; variant: ButtonVariant } {
  const { type, color, variant, danger, ghost } = input;

  // >>> Local
  let parsedColor: ButtonColor;
  let parsedVariant: ButtonVariant;
  if (color && variant) {
    [parsedColor, parsedVariant] = [color, variant];
  } else if (type || danger) {
    const pair = ButtonTypeMap[type ?? 'default'];
    if (danger) {
      [parsedColor, parsedVariant] = ['danger', pair[1]];
    } else {
      [parsedColor, parsedVariant] = pair;
    }
  } else if (variant === 'solid') {
    [parsedColor, parsedVariant] = ['primary', 'solid'];
  } else {
    [parsedColor, parsedVariant] = ['default', 'outlined'];
  }

  // >>> Ghost：solid 降级 outlined
  if (ghost && parsedVariant === 'solid') {
    return { color: parsedColor, variant: 'outlined' };
  }
  return { color: parsedColor, variant: parsedVariant };
}

/** 对位 antd getLoadingConfig：loading(boolean) + delay 数值 → 生效配置。 */
export function getLoadingConfig(loading: boolean, delay: number): { loading: boolean; delay: number } {
  const d = Number.isFinite(delay) && delay > 0 ? delay : 0;
  return { loading: d <= 0 ? loading : false, delay: d };
}
