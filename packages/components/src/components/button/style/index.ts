import { baseControlStyles } from '../../../styles.js';
import { buttonTokens } from './token.js';
import { buttonVariantStyles } from './variant.js';
import { buttonShapeSizeStyles } from './shape-size.js';

/** 组合导出的 Button 全部样式。Task 6 创建 group.js 后在此补 import 并加入数组。 */
export const buttonStyles = [
  baseControlStyles,
  buttonTokens,
  buttonVariantStyles,
  buttonShapeSizeStyles,
];
