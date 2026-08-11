import { css } from 'lit';

/**
 * 对位 antd Input style/index.js 的 genAffixStyle：affix-wrapper 布局、
 * prefix / suffix 间距、clear-icon、show-count-suffix、password-icon。
 * 基础（padding / 字号 / 圆角）与变体（border/background/focus）在 variant.ts 里，
 * 变体类同时加在裸 input 与 affix-wrapper 上，这里只补 affix 专属部分。
 */
export const inputAffixStyles = css`
  /* ===== affix-wrapper 基础（对位 genAffixStyle 里的 genBasicInputStyle 展开） ===== */
  .ooa-input-affix-wrapper {
    position: relative;
    display: inline-flex;
    width: 100%;
    min-width: 0;
    padding: var(--ooa-input-padding-block, 4px) var(--ooa-input-padding-inline, 11px);
    color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    font-size: var(--ooa-input-font-size, 14px);
    line-height: var(--ooa-line-height, 1.5714);
    border-radius: var(--ooa-border-radius, 6px);
    transition: all var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease);
    /* 边框/背景由变体类提供；基础态给透明占位避免 layout shift */
    background: transparent;
    border: var(--ooa-line-width, 1px) var(--ooa-line-type, solid) transparent;
  }
  .ooa-input-affix-wrapper.ooa-input-affix-wrapper-lg {
    padding: var(--ooa-input-padding-block-lg, 7px) var(--ooa-input-padding-inline-lg, 11px);
    font-size: var(--ooa-input-font-size-lg, 16px);
    line-height: var(--ooa-line-height-lg, 1.5);
    border-radius: var(--ooa-border-radius-lg, 8px);
  }
  .ooa-input-affix-wrapper.ooa-input-affix-wrapper-sm {
    padding: var(--ooa-input-padding-block-sm, 0px) var(--ooa-input-padding-inline-sm, 7px);
    font-size: var(--ooa-input-font-size-sm, 14px);
    border-radius: var(--ooa-border-radius-sm, 4px);
  }
  .ooa-input-affix-wrapper-focused,
  .ooa-input-affix-wrapper:focus {
    z-index: 1;
  }

  /* ===== 内部 input 归零（对位 antd 6.5.0 编译产物：仅 > input 清 padding，textarea 保留 base padding） ===== */
  .ooa-input-affix-wrapper > input.ooa-input {
    padding: 0;
    font-size: inherit;
    border: none;
    border-radius: 0;
    outline: none;
    background: transparent;
    color: inherit;
  }
  .ooa-input-affix-wrapper > textarea.ooa-input {
    font-size: inherit;
    border: none;
    border-radius: 0;
    outline: none;
    background: transparent;
    color: inherit;
  }
  .ooa-input-affix-wrapper > input.ooa-input:focus,
  .ooa-input-affix-wrapper > textarea.ooa-input:focus {
    box-shadow: none !important;
  }
  .ooa-input-affix-wrapper > input.ooa-input::-ms-reveal {
    display: none;
  }

  /* 占位零宽字符：让 affix-wrapper 内无前缀时 input 从最左开始（对位 antd ::before） */
  .ooa-input-affix-wrapper::before {
    display: inline-block;
    width: 0;
    visibility: hidden;
    content: '\\a0';
  }

  /* ===== prefix / suffix 容器（对位 genAffixStyle 的 flex 布局） ===== */
  .ooa-input-prefix,
  .ooa-input-suffix {
    display: flex;
    flex: none;
    align-items: center;
  }
  .ooa-input-prefix > *:not(:last-child),
  .ooa-input-suffix > *:not(:last-child) {
    margin-inline-end: var(--ooa-padding-xs, 8px);
  }
  .ooa-input-prefix {
    margin-inline-end: var(--ooa-input-affix-padding, 4px);
  }
  .ooa-input-suffix {
    margin-inline-start: var(--ooa-input-affix-padding, 4px);
  }
  .ooa-input-show-count-suffix {
    color: var(--ooa-color-text-description, rgba(0, 0, 0, 0.45));
    direction: ltr;
  }
  .ooa-input-show-count-has-suffix {
    margin-inline-end: var(--ooa-padding-xxs, 4px);
  }

  /* ===== clear-icon（对位 genAllowClearStyle） ===== */
  .ooa-input-clear-icon {
    margin: 0;
    padding: 0;
    line-height: 0;
    color: var(--ooa-color-text-quaternary, rgba(0, 0, 0, 0.25));
    font-size: var(--ooa-font-size-icon, 12px);
    vertical-align: -1px;
    cursor: pointer;
    transition: color var(--ooa-motion-duration-slow, 0.3s);
    border: none;
    outline: none;
    background-color: transparent;
  }
  .ooa-input-clear-icon:hover {
    color: var(--ooa-color-icon, rgba(0, 0, 0, 0.45));
  }
  .ooa-input-clear-icon:focus-visible {
    color: var(--ooa-color-icon, rgba(0, 0, 0, 0.45));
    border-radius: var(--ooa-border-radius-sm, 4px);
    outline: var(--ooa-line-width, 1px) solid var(--ooa-color-primary, #1677ff);
    outline-offset: 0;
  }
  .ooa-input-clear-icon:active {
    color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
  }
  .ooa-input-clear-icon-hidden {
    visibility: hidden;
  }
  .ooa-input-clear-icon-has-suffix {
    margin: 0 var(--ooa-input-affix-padding, 4px);
  }

  /* ===== password 图标（对位 antd password-icon） ===== */
  .ooa-input-password-icon {
    display: inline-flex;
    color: var(--ooa-color-icon, rgba(0, 0, 0, 0.45));
    cursor: pointer;
    transition: all var(--ooa-motion-duration-slow, 0.3s);
  }
  .ooa-input-password-icon:hover {
    color: var(--ooa-color-icon-hover, rgba(0, 0, 0, 0.88));
  }
  .ooa-input-affix-wrapper-disabled .ooa-input-password-icon,
  .ooa-input-affix-wrapper-disabled .ooa-input-password-icon:hover {
    color: var(--ooa-color-icon, rgba(0, 0, 0, 0.45));
    cursor: not-allowed;
  }
`;
