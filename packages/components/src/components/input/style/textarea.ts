import { css } from 'lit';

/**
 * 对位 antd Input style/textarea.ts 的 genTextAreaStyle：裸 textarea 的
 * 尺寸/缩放、affix-wrapper 内 textarea 归零、data-count 定位、allow-clear 预留。
 * affix 布局本身在 affix.ts，这里只补 textarea 专属规则。
 */
export const inputTextareaStyles = css`
  /* ===== 裸 textarea（对位 antd textarea+componentCls 选择器） ===== */
  textarea.ooa-input {
    max-width: 100%; /* prevent textarea resize from coming out of its container */
    height: auto;
    min-height: var(--ooa-control-height, 32px);
    line-height: var(--ooa-line-height, 1.5714);
    vertical-align: bottom;
    transition: all var(--ooa-motion-duration-slow, 0.3s);
    resize: vertical;
  }
  @media (hover: none) and (pointer: coarse) {
    textarea.ooa-input {
      resize: none;
    }
  }

  /* ===== show-count 计数定位（对位 -show-count 的 data-count） ===== */
  .ooa-input-textarea-show-count .ooa-input-data-count {
    position: absolute;
    bottom: calc(-1 * var(--ooa-font-size, 14px) * var(--ooa-line-height, 1.5714));
    inset-inline-end: 0;
    color: var(--ooa-color-text-description, rgba(0, 0, 0, 0.45));
    white-space: nowrap;
    pointer-events: none;
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper-rtl .ooa-input-suffix .ooa-input-data-count {
    direction: ltr;
    inset-inline-start: 0;
  }

  /* ===== allow-clear / feedback 给 textarea 预留右内边距 ===== */
  .ooa-input-textarea-allow-clear > textarea.ooa-input,
  .ooa-input-textarea-affix-wrapper.ooa-input-textarea-affix-wrapper-has-feedback > textarea.ooa-input {
    padding-inline-end: var(--ooa-padding-lg, 24px);
  }

  /* ===== affix-wrapper 内 textarea 归零（对位 textareaPrefixCls 分支） ===== */
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper {
    padding: 0;
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper > textarea.ooa-input {
    font-size: inherit;
    border: none;
    outline: none;
    background: transparent;
    min-height: calc(var(--ooa-control-height, 32px) - 2 * var(--ooa-line-width, 1px));
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper > textarea.ooa-input:focus {
    box-shadow: none !important;
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper .ooa-input-suffix {
    margin: 0;
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper .ooa-input-suffix > *:not(:last-child) {
    margin-inline: 0;
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper .ooa-input-suffix .ooa-input-clear-icon {
    position: absolute;
    inset-inline-end: var(--ooa-control-padding-horizontal, 12px);
    inset-block-start: var(--ooa-padding-xs, 8px);
  }
  .ooa-input-textarea-affix-wrapper.ooa-input-affix-wrapper-sm .ooa-input-suffix .ooa-input-clear-icon {
    inset-inline-end: var(--ooa-control-padding-horizontal-sm, 8px);
  }
`;
