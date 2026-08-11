// 类型从常量数组推导（对位 antd `_InputTypes` / `_InputVariants` 模式），避免双源漂移。

const _InputVariants = ['outlined', 'borderless', 'filled', 'underlined'] as const;
export type InputVariant = (typeof _InputVariants)[number];
export const INPUT_VARIANTS: readonly InputVariant[] = _InputVariants;

export type InputStatus = 'error' | 'warning';

/** OOA 侧 size 是 OoaSize（small/middle/large），antd v6 也支持 medium 别名，统一归一化。 */
export type InputSize = 'small' | 'middle' | 'large';

/** 对位 antd `useVariant('input', customVariant, bordered)`：bordered 旧 API 归一化为 borderless；缺省 outlined。 */
export function resolveVariant(variant: InputVariant | undefined, bordered: boolean): InputVariant {
  if (variant) return variant;
  return bordered ? 'outlined' : 'borderless';
}

/** medium/middle 归一化为 middle（v6 medium 即 middle 的别名）。 */
export function resolveSize(size: string | undefined): InputSize {
  return size === 'medium' ? 'middle' : ((size as InputSize) ?? 'middle');
}

/** showCount 默认计数文本（对位 antd dataCount 默认 formatter）：有 maxLength 显示 `count / maxLength`，否则仅 count。 */
export function formatCount(value: string, maxLength: number | undefined): string {
  return maxLength !== undefined ? `${value.length} / ${maxLength}` : `${value.length}`;
}

/** clear 图标是否可见（对位 rc-input BaseInput needClear）：非 disabled/readOnly 且有值。 */
export function shouldShowClear(value: string, disabled: boolean, readOnly: boolean, allowClear: boolean): boolean {
  return allowClear && !disabled && !readOnly && value.length > 0;
}

/** 纯 textarea 分支（对位 rc-input TextArea isPureTextArea）：autoSize/showCount/allowClear 全缺省时直接渲染 textarea。 */
export function isPureTextArea(autoSize: boolean, showCount: boolean, allowClear: boolean): boolean {
  return !autoSize && !showCount && !allowClear;
}
