import { baseControlStyles } from '../../../styles.js';
import { buttonTokens } from './token.js';
import { buttonVariantStyles } from './variant.js';
import { buttonShapeSizeStyles } from './shape-size.js';
import { buttonGroupStyles } from './group.js';

/** 组合导出的 Button 全部样式。 */
export const buttonStyles = [
  baseControlStyles,
  buttonTokens,
  buttonVariantStyles,
  buttonShapeSizeStyles,
  buttonGroupStyles,
];
