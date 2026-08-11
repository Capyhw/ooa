import { css, unsafeCSS } from 'lit';

/**
 * 对位 antd Input style/index.js（genBasicInputStyle + genInputStyle + variants.js）。
 * 变体/状态类直接加在元素上（.ooa-input-outlined 等，对位 antd 的 .ant-input-outlined）：
 * 无 affix 时加在 input 上，有 affix 时加在 affix-wrapper 上，故用 :is(.ooa-input, .ooa-input-affix-wrapper) 合并选择器。
 * 同一份样式可被 textarea / otp / search 复用（它们内部的 .ooa-input 也会命中）。
 * 所有颜色一律 var(--ooa-*) + antd 兜底，不写死。
 */

/** 同时命中裸 input 与 affix-wrapper 的选择器前缀。 */
const INPUT_BOX = ':is(.ooa-input, .ooa-input-affix-wrapper)';

export const inputVariantStyles = css`
  /* ===== 基础（对位 genBasicInputStyle） ===== */
  .ooa-input {
    position: relative;
    display: inline-block;
    width: 100%;
    min-width: 0;
    padding: var(--ooa-input-padding-block, 4px) var(--ooa-input-padding-inline, 11px);
    color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    font-family: inherit;
    font-size: var(--ooa-input-font-size, 14px);
    line-height: var(--ooa-line-height, 1.5714);
    border-radius: var(--ooa-border-radius, 6px);
    transition: all var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease);
    /* 边框/背景由变体类提供；基础态给透明占位避免 layout shift */
    background: transparent;
    border: var(--ooa-line-width, 1px) var(--ooa-line-type, solid) transparent;
    outline: none;
  }
  .ooa-input::placeholder {
    color: var(--ooa-color-text-placeholder, rgba(0, 0, 0, 0.25));
    user-select: none;
  }
  .ooa-input:placeholder-shown {
    text-overflow: ellipsis;
  }
  .ooa-input.ooa-input-lg {
    padding: var(--ooa-input-padding-block-lg, 7px) var(--ooa-input-padding-inline-lg, 11px);
    font-size: var(--ooa-input-font-size-lg, 16px);
    line-height: var(--ooa-line-height-lg, 1.5);
    border-radius: var(--ooa-border-radius-lg, 8px);
  }
  .ooa-input.ooa-input-sm {
    padding: var(--ooa-input-padding-block-sm, 0px) var(--ooa-input-padding-inline-sm, 7px);
    font-size: var(--ooa-input-font-size-sm, 14px);
    border-radius: var(--ooa-border-radius-sm, 4px);
  }

  /* ===== Outlined（对位 genOutlinedStyle） ===== */
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined {
    background: var(--ooa-color-bg-container, #fff);
    border-color: var(--ooa-color-border, #d9d9d9);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined:hover {
    border-color: var(--ooa-input-hover-border-color, #4096ff);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined:focus-within {
    border-color: var(--ooa-input-active-border-color, #1677ff);
    box-shadow: var(--ooa-input-active-shadow, 0 0 0 2px rgba(5, 145, 255, 0.1));
    outline: 0;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined:disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined[disabled] {
    color: var(--ooa-color-text-disabled, rgba(0, 0, 0, 0.25));
    background-color: var(--ooa-color-bg-container-disabled, rgba(0, 0, 0, 0.04));
    border-color: var(--ooa-color-border-disabled, #d9d9d9);
    box-shadow: none;
    cursor: not-allowed;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-error {
    border-color: var(--ooa-color-error, #ff4d4f);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-error:hover {
    border-color: var(--ooa-color-error-border-hover, #ff7875);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-error:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-error:focus-within {
    border-color: var(--ooa-color-error, #ff4d4f);
    box-shadow: var(--ooa-input-error-active-shadow, 0 0 0 2px rgba(255, 38, 5, 0.06));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-warning {
    border-color: var(--ooa-color-warning, #faad14);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-warning:hover {
    border-color: var(--ooa-color-warning-border-hover, #ffd666);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-warning:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-outlined.ooa-input-status-warning:focus-within {
    border-color: var(--ooa-color-warning, #faad14);
    box-shadow: var(--ooa-input-warning-active-shadow, 0 0 0 2px rgba(255, 215, 5, 0.1));
  }

  /* ===== Filled（对位 genFilledStyle） ===== */
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled {
    background: var(--ooa-color-fill-tertiary, rgba(0, 0, 0, 0.04));
    border-color: transparent;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled:hover {
    background: var(--ooa-color-fill-secondary, rgba(0, 0, 0, 0.06));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled:focus-within {
    background: var(--ooa-color-bg-container, #fff);
    border-color: var(--ooa-input-active-border-color, #1677ff);
    outline: 0;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled:disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled[disabled] {
    color: var(--ooa-color-text-disabled, rgba(0, 0, 0, 0.25));
    background-color: var(--ooa-color-bg-container-disabled, rgba(0, 0, 0, 0.04));
    border-color: transparent;
    box-shadow: none;
    cursor: not-allowed;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-error {
    background: var(--ooa-color-error-bg, #fff2f0);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-error:hover {
    background: var(--ooa-color-error-bg-hover, #fff1f0);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-error:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-error:focus-within {
    background: var(--ooa-color-bg-container, #fff);
    border-color: var(--ooa-color-error, #ff4d4f);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-warning {
    background: var(--ooa-color-warning-bg, #fffbe6);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-warning:hover {
    background: var(--ooa-color-warning-bg-hover, #fff7e6);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-warning:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-filled.ooa-input-status-warning:focus-within {
    background: var(--ooa-color-bg-container, #fff);
    border-color: var(--ooa-color-warning, #faad14);
  }

  /* ===== Borderless（对位 genBorderlessStyle） ===== */
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless {
    background: transparent;
    border: none;
    /* 补偿移除的边框，保持与其它变体高度一致 */
    padding-block: calc(var(--ooa-input-padding-block, 4px) + var(--ooa-line-width, 1px));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-sm {
    padding-block: calc(var(--ooa-input-padding-block-sm, 0px) + var(--ooa-line-width, 1px));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-lg {
    padding-block: calc(var(--ooa-input-padding-block-lg, 7px) + var(--ooa-line-width, 1px));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless:focus-within {
    outline: none;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless:focus-visible,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless:has(input:focus-visible),
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless:has(textarea:focus-visible) {
    outline: var(--ooa-line-width, 1px) var(--ooa-line-type, solid) var(--ooa-input-active-border-color, #1677ff);
    outline-offset: calc(-1 * var(--ooa-line-width, 1px));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless:disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless[disabled] {
    color: var(--ooa-color-text-disabled, rgba(0, 0, 0, 0.25));
    cursor: not-allowed;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-status-error,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-status-error .ooa-input {
    color: var(--ooa-color-error, #ff4d4f);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-status-warning,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-borderless.ooa-input-status-warning .ooa-input {
    color: var(--ooa-color-warning, #faad14);
  }

  /* ===== Underlined（对位 genUnderlinedStyle） ===== */
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined {
    background: var(--ooa-color-bg-container, #fff);
    border-width: var(--ooa-line-width, 1px) 0;
    border-style: var(--ooa-line-type, solid) none;
    border-color: transparent transparent var(--ooa-color-border, #d9d9d9) transparent;
    border-radius: 0;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined:hover {
    border-color: transparent transparent var(--ooa-input-hover-border-color, #4096ff) transparent;
    background-color: var(--ooa-color-bg-container, #fff);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined:focus-within {
    border-color: transparent transparent var(--ooa-input-active-border-color, #1677ff) transparent;
    outline: 0;
    background-color: var(--ooa-color-bg-container, #fff);
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined:disabled,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined[disabled] {
    color: var(--ooa-color-text-disabled, rgba(0, 0, 0, 0.25));
    box-shadow: none;
    cursor: not-allowed;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-status-error {
    border-color: transparent transparent var(--ooa-color-error, #ff4d4f) transparent;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-status-error:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-status-error:focus-within {
    border-color: transparent transparent var(--ooa-color-error, #ff4d4f) transparent;
    box-shadow: var(--ooa-input-error-active-shadow, 0 0 0 2px rgba(255, 38, 5, 0.06));
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-status-warning {
    border-color: transparent transparent var(--ooa-color-warning, #faad14) transparent;
  }
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-status-warning:focus,
  ${unsafeCSS(INPUT_BOX)}.ooa-input-underlined.ooa-input-status-warning:focus-within {
    border-color: transparent transparent var(--ooa-color-warning, #faad14) transparent;
    box-shadow: var(--ooa-input-warning-active-shadow, 0 0 0 2px rgba(255, 215, 5, 0.1));
  }

  /* ===== Disabled（对位 genDisabledStyle 的 input 内部） ===== */
  .ooa-input:disabled,
  .ooa-input[disabled] {
    cursor: not-allowed;
  }

  /* ===== 状态下的 affix 颜色（对位 gen*StatusStyle 的 prefix/suffix 颜色） ===== */
  .ooa-input-affix-wrapper.ooa-input-status-error .ooa-input-prefix,
  .ooa-input-affix-wrapper.ooa-input-status-error .ooa-input-suffix {
    color: var(--ooa-color-error-affix, #ff4d4f);
  }
  .ooa-input-affix-wrapper.ooa-input-status-warning .ooa-input-prefix,
  .ooa-input-affix-wrapper.ooa-input-status-warning .ooa-input-suffix {
    color: var(--ooa-color-warning-affix, #faad14);
  }
`;
