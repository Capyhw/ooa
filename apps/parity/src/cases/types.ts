import type { ReactNode } from 'react';

export type ComponentSize = 'small' | 'middle' | 'large';
export type ThemeName = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';
export type InputStatus = 'error' | 'warning';
export type SurfaceName = 'ooa' | 'antd';
export type ParityComponent = 'button' | 'input';

/**
 * Case 渲染上下文。size / disabled / theme / direction 不再由 case 或 toolbar
 * 逐项控制，而是通过两侧的 config-provider 全局下发；这里只保留跨实现共享的
 * 受控输入值，用于验证输入类组件在两侧的受控行为是否一致。
 */
export interface CaseContext {
  value: string;
  onValueChange: (value: string) => void;
}

export interface ParityCase {
  id: string;
  component: ParityComponent;
  label: string;
  render: (surface: SurfaceName, context: CaseContext) => ReactNode;
}
