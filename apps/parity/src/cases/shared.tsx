import type { ReactNode } from 'react';
import { createElement, useEffect, useRef } from 'react';
import type { CaseContext, InputStatus } from './types';

export const OoaButton = (props: Record<string, unknown>, children: ReactNode) =>
  createElement('ooa-button', props, children);

interface OoaInputProps {
  allowClear?: boolean;
  maxLength?: number;
  placeholder?: string;
  showCount?: boolean;
  status?: InputStatus;
  value: string;
  onValueChange: (value: string) => void;
}

export function OoaInput({ onValueChange, ...props }: OoaInputProps) {
  const inputRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      onValueChange(detail?.value ?? '');
    };

    element.addEventListener('ooa-change', handleChange);
    return () => element.removeEventListener('ooa-change', handleChange);
  }, [onValueChange]);

  return createElement('ooa-input', { ...props, ref: inputRef });
}

export function OoaTextArea({ context, rows = 4 }: { context: CaseContext; rows?: number }) {
  const textareaRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      context.onValueChange(detail?.value ?? '');
    };

    element.addEventListener('ooa-change', handleChange);
    return () => element.removeEventListener('ooa-change', handleChange);
  }, [context.onValueChange]);

  return createElement('ooa-textarea', {
    ref: textareaRef,
    value: context.value,
    placeholder: 'Write a short note',
    rows,
    'max-length': 120,
    'show-count': true,
  });
}

export function DemoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="demo-block">
      <div className="demo-label">{label}</div>
      {children}
    </section>
  );
}
