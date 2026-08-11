import type { ReactNode } from 'react';
import { createElement, useEffect, useRef } from 'react';
import type { CaseContext, InputStatus } from './types';

export const OoaButton = (props: Record<string, unknown>, children: ReactNode) =>
  createElement('ooa-button', props, children);

/** 监听自定义元素上的 `ooa-change`，把 detail.value 桥接成 React 回调。 */
function useOoaChange(ref: React.RefObject<HTMLElement | null>, onValueChange: (value: string) => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      onValueChange(detail?.value ?? '');
    };
    element.addEventListener('ooa-change', handler);
    return () => element.removeEventListener('ooa-change', handler);
  }, [onValueChange]);
}

export interface OoaInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  allowClear?: boolean;
  showCount?: boolean;
  maxLength?: number;
  status?: InputStatus;
  size?: string;
  variant?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  /** 前缀内容 → `slot="prefix"`（对位 antd prefix prop）。 */
  prefix?: ReactNode;
  /** 后缀内容 → `slot="suffix"`（对位 antd suffix prop）。 */
  suffix?: ReactNode;
}

export function OoaInput({ onValueChange, prefix, suffix, ...props }: OoaInputProps) {
  const inputRef = useRef<HTMLElement | null>(null);
  useOoaChange(inputRef, onValueChange);

  // antd 走 camelCase prop，ooa 走 kebab-case 属性（对位 docs/component-replication.md §3.2）。
  const ooaAttrs: Record<string, string | number | boolean | undefined> = {
    'allow-clear': props.allowClear,
    'max-length': props.maxLength,
    placeholder: props.placeholder,
    'show-count': props.showCount,
    status: props.status,
    size: props.size,
    variant: props.variant,
    type: props.type,
    disabled: props.disabled,
    readonly: props.readOnly,
    name: props.name,
  };

  const children: ReactNode[] = [];
  if (prefix !== undefined) children.push(createElement('span', { slot: 'prefix' }, prefix));
  if (suffix !== undefined) children.push(createElement('span', { slot: 'suffix' }, suffix));

  return createElement('ooa-input', { ...ooaAttrs, value: props.value, ref: inputRef }, ...children);
}

export interface OoaTextAreaProps {
  context: CaseContext;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  showCount?: boolean;
  allowClear?: boolean;
  autoSize?: boolean;
  status?: InputStatus;
  size?: string;
  variant?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export function OoaTextArea({ context, rows = 4, ...props }: OoaTextAreaProps) {
  const textareaRef = useRef<HTMLElement | null>(null);
  useOoaChange(textareaRef, context.onValueChange);

  const ooaAttrs: Record<string, string | number | boolean | undefined> = {
    rows,
    'max-length': props.maxLength,
    placeholder: props.placeholder,
    'show-count': props.showCount,
    'allow-clear': props.allowClear,
    'auto-size': props.autoSize,
    status: props.status,
    size: props.size,
    variant: props.variant,
    disabled: props.disabled,
    readonly: props.readOnly,
  };

  return createElement('ooa-textarea', { ...ooaAttrs, value: context.value, ref: textareaRef });
}

export interface OoaPasswordProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  visibilityToggle?: boolean;
  disabled?: boolean;
  size?: string;
  variant?: string;
  status?: InputStatus;
}

/** 对位 antd Input.Password：复用 ooa-input 的事件桥接，额外暴露 visibility-toggle。 */
export function OoaPassword({ onValueChange, ...props }: OoaPasswordProps) {
  const passwordRef = useRef<HTMLElement | null>(null);
  useOoaChange(passwordRef, onValueChange);

  const ooaAttrs: Record<string, string | boolean | undefined> = {
    placeholder: props.placeholder,
    'allow-clear': props.allowClear,
    'visibility-toggle': props.visibilityToggle,
    disabled: props.disabled,
    size: props.size,
    variant: props.variant,
    status: props.status,
  };

  return createElement('ooa-password', { ...ooaAttrs, value: props.value, ref: passwordRef });
}

export interface OoaSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  enterButton?: boolean | string;
  loading?: boolean;
  disabled?: boolean;
  size?: string;
  variant?: string;
  status?: InputStatus;
}

/** 对位 antd Input.Search：桥接 `ooa-change`（值同步）与 `ooa-search`（搜索触发）。 */
export function OoaSearch({ onValueChange, onSearch, ...props }: OoaSearchProps) {
  const searchRef = useRef<HTMLElement | null>(null);
  useOoaChange(searchRef, onValueChange);

  useEffect(() => {
    const element = searchRef.current;
    if (!element) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      onSearch?.(detail?.value ?? '');
    };
    element.addEventListener('ooa-search', handler);
    return () => element.removeEventListener('ooa-search', handler);
  }, [onSearch]);

  const ooaAttrs: Record<string, string | number | boolean | undefined> = {
    placeholder: props.placeholder,
    'allow-clear': props.allowClear,
    'enter-button': props.enterButton,
    loading: props.loading,
    disabled: props.disabled,
    size: props.size,
    variant: props.variant,
    status: props.status,
  };

  return createElement('ooa-search', { ...ooaAttrs, value: props.value, ref: searchRef });
}

export interface OoaOtpProps {
  value: string;
  onValueChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  mask?: boolean | string;
  formatter?: (text: string) => string;
  separator?: string;
  variant?: string;
  size?: string;
  status?: InputStatus;
}

/** 对位 antd Input.OTP：用 `ooa-input` 事件做中间值同步（对位 antd onInput）。 */
export function OoaOtp({ onValueChange, formatter, ...props }: OoaOtpProps) {
  const otpRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = otpRef.current;
    if (!element) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      onValueChange(detail?.value ?? '');
    };
    element.addEventListener('ooa-input', handler);
    return () => element.removeEventListener('ooa-input', handler);
  }, [onValueChange]);

  // formatter 是函数属性，React 只能经属性设置，不能用 attribute。
  useEffect(() => {
    const element = otpRef.current;
    if (!element) return;
    (element as unknown as { formatter?: (text: string) => string }).formatter = formatter;
  }, [formatter]);

  const ooaAttrs: Record<string, string | number | boolean | undefined> = {
    length: props.length,
    disabled: props.disabled,
    mask: props.mask,
    separator: props.separator,
    variant: props.variant,
    size: props.size,
    status: props.status,
  };

  return createElement('ooa-otp', { ...ooaAttrs, value: props.value, ref: otpRef });
}

export function DemoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="demo-block">
      <div className="demo-label">{label}</div>
      {children}
    </section>
  );
}
