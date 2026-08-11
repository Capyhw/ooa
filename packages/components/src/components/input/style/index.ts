import { baseControlStyles } from '../../../styles.js';
import { inputTokens } from './token.js';
import { inputVariantStyles } from './variant.js';
import { inputAffixStyles } from './affix.js';
import { inputTextareaStyles } from './textarea.js';

/**
 * 组合导出的 Input 家族全部样式。input / textarea / password / search / otp
 * 共用同一份 base + token + variant + affix，textarea 额外叠加 textarea 专属样式。
 */
export const inputStyles = [
  baseControlStyles,
  inputTokens,
  inputVariantStyles,
  inputAffixStyles,
  inputTextareaStyles,
];
