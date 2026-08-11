import { describe, expect, it } from 'vitest';
import {
  formatCount,
  isPureTextArea,
  resolveSize,
  resolveVariant,
  shouldShowClear,
} from '../input-helpers.js';

describe('resolveVariant（对位 antd useVariant：bordered 旧 API → borderless）', () => {
  it('显式 variant 优先', () => {
    expect(resolveVariant('filled', true)).toBe('filled');
    expect(resolveVariant('borderless', false)).toBe('borderless');
  });
  it('缺省 + bordered=true → outlined', () => {
    expect(resolveVariant(undefined, true)).toBe('outlined');
  });
  it('缺省 + bordered=false → borderless', () => {
    expect(resolveVariant(undefined, false)).toBe('borderless');
  });
});

describe('resolveSize（medium/middle 归一化）', () => {
  it('medium → middle', () => {
    expect(resolveSize('medium')).toBe('middle');
  });
  it('small/large 透传', () => {
    expect(resolveSize('small')).toBe('small');
    expect(resolveSize('large')).toBe('large');
  });
  it('缺省 → middle', () => {
    expect(resolveSize(undefined)).toBe('middle');
  });
});

describe('formatCount（对位 antd dataCount 默认 formatter）', () => {
  it('有 maxLength → `count / maxLength`', () => {
    expect(formatCount('abc', 10)).toBe('3 / 10');
  });
  it('无 maxLength → 仅 count', () => {
    expect(formatCount('abc', undefined)).toBe('3');
  });
  it('空值 → 0', () => {
    expect(formatCount('', 8)).toBe('0 / 8');
  });
});

describe('shouldShowClear（对位 BaseInput needClear）', () => {
  it('非 disabled/readOnly 且有值 → true', () => {
    expect(shouldShowClear('v', false, false, true)).toBe(true);
  });
  it('无 allowClear → false', () => {
    expect(shouldShowClear('v', false, false, false)).toBe(false);
  });
  it('空值 → false', () => {
    expect(shouldShowClear('', false, false, true)).toBe(false);
  });
  it('disabled / readOnly → false', () => {
    expect(shouldShowClear('v', true, false, true)).toBe(false);
    expect(shouldShowClear('v', false, true, true)).toBe(false);
  });
});

describe('isPureTextArea（对位 rc-input isPureTextArea：autoSize/showCount/allowClear 全缺省）', () => {
  it('全缺省 → true', () => {
    expect(isPureTextArea(false, false, false)).toBe(true);
  });
  it('任一开启 → false', () => {
    expect(isPureTextArea(true, false, false)).toBe(false);
    expect(isPureTextArea(false, true, false)).toBe(false);
    expect(isPureTextArea(false, false, true)).toBe(false);
  });
});
