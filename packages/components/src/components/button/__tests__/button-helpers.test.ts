import { expect } from 'vitest';
import {
  PRESET_COLORS,
  getLoadingConfig,
  isTwoCNChar,
  isUnBorderedVariant,
  resolveColorVariant,
  type ButtonColor,
} from '../button-helpers.js';

describe('isTwoCNChar', () => {
  it('命中两个汉字', () => {
    expect(isTwoCNChar('按钮')).toBe(true);
    expect(isTwoCNChar('返回')).toBe(true);
  });
  it('未命中', () => {
    expect(isTwoCNChar('按钮组')).toBe(false);
    expect(isTwoCNChar('OK')).toBe(false);
    expect(isTwoCNChar('A')).toBe(false);
  });
});

describe('isUnBorderedVariant', () => {
  it('text/link 无边框', () => {
    expect(isUnBorderedVariant('text')).toBe(true);
    expect(isUnBorderedVariant('link')).toBe(true);
  });
  it('其余有边框', () => {
    expect(isUnBorderedVariant('solid')).toBe(false);
    expect(isUnBorderedVariant('outlined')).toBe(false);
    expect(isUnBorderedVariant('dashed')).toBe(false);
    expect(isUnBorderedVariant('filled')).toBe(false);
  });
});

describe('resolveColorVariant', () => {
  it('缺省为 outlined default', () => {
    expect(resolveColorVariant({})).toEqual({ color: 'default', variant: 'outlined' });
  });
  it('type 语法糖经 ButtonTypeMap 推导', () => {
    expect(resolveColorVariant({ type: 'default' })).toEqual({ color: 'default', variant: 'outlined' });
    expect(resolveColorVariant({ type: 'primary' })).toEqual({ color: 'primary', variant: 'solid' });
    expect(resolveColorVariant({ type: 'dashed' })).toEqual({ color: 'default', variant: 'dashed' });
    expect(resolveColorVariant({ type: 'text' })).toEqual({ color: 'default', variant: 'text' });
    expect(resolveColorVariant({ type: 'link' })).toEqual({ color: 'link', variant: 'link' });
  });
  it('danger 只改 color 轴', () => {
    expect(resolveColorVariant({ danger: true })).toEqual({ color: 'danger', variant: 'outlined' });
    expect(resolveColorVariant({ type: 'primary', danger: true })).toEqual({ color: 'danger', variant: 'solid' });
    expect(resolveColorVariant({ type: 'text', danger: true })).toEqual({ color: 'danger', variant: 'text' });
  });
  it('color+variant 显式优先', () => {
    expect(resolveColorVariant({ color: 'red', variant: 'filled' })).toEqual({ color: 'red', variant: 'filled' });
    expect(resolveColorVariant({ color: 'primary', variant: 'solid', type: 'text' })).toEqual({ color: 'primary', variant: 'solid' });
  });
  it('variant solid 无 color 时 color 归 primary', () => {
    expect(resolveColorVariant({ variant: 'solid' })).toEqual({ color: 'primary', variant: 'solid' });
  });
  it('ghost 把 solid 降级为 outlined', () => {
    expect(resolveColorVariant({ type: 'primary', ghost: true })).toEqual({ color: 'primary', variant: 'outlined' });
    expect(resolveColorVariant({ variant: 'solid', ghost: true })).toEqual({ color: 'primary', variant: 'outlined' });
    expect(resolveColorVariant({ color: 'red', variant: 'solid', ghost: true })).toEqual({ color: 'red', variant: 'outlined' });
    expect(resolveColorVariant({ type: 'text', ghost: true })).toEqual({ color: 'default', variant: 'text' });
  });
  it('preset color 直通', () => {
    for (const c of PRESET_COLORS as readonly ButtonColor[]) {
      expect(resolveColorVariant({ color: c, variant: 'outlined' }).color).toBe(c);
    }
  });
});

describe('getLoadingConfig', () => {
  it('delay<=0 时 loading 立即生效', () => {
    expect(getLoadingConfig(true, 0)).toEqual({ loading: true, delay: 0 });
  });
  it('delay>0 时延迟生效，loading 暂为 false', () => {
    expect(getLoadingConfig(false, 200)).toEqual({ loading: false, delay: 200 });
  });
  it('delay<=0 且 loading false', () => {
    expect(getLoadingConfig(false, 0)).toEqual({ loading: false, delay: 0 });
  });
});
