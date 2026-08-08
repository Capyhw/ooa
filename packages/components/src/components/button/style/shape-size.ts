import { css } from 'lit';

/** 布局/形状/尺寸/block/loading/icon-only/两汉字 等共享规则（对位 antd genSharedButtonStyle 等）。 */
export const buttonShapeSizeStyles = css`
  :host { display: inline-block; }
  :host([block]) { display: block; }

  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ooa-btn-icon-gap, 8px);
    min-width: 0;
    height: var(--ooa-control-height, 32px);
    margin: 0;
    padding: 0 var(--ooa-btn-padding-inline, 15px);
    font: inherit;
    font-size: var(--ooa-btn-content-font-size, 14px);
    font-weight: 400;
    line-height: var(--ooa-btn-content-line-height, 1.5714);
    white-space: nowrap;
    text-align: center;
    cursor: pointer;
    border-radius: var(--ooa-border-radius, 6px);
    outline: none;
    user-select: none;
    touch-action: manipulation;
    transition: color var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      border-color var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      background var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      box-shadow var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease);
  }

  /* 形状（shape 是宿主属性） */
  :host([shape="round"]) button { border-radius: 999px; }
  :host([shape="circle"]) button { min-width: var(--ooa-control-height, 32px); padding-inline: 0; border-radius: 50%; }
  :host([shape="square"]) button { min-width: var(--ooa-control-height, 32px); padding-inline: 0; }

  /* 尺寸：类加在内部 button 上（对齐 antd DOM） */
  button.ooa-btn-sm { height: var(--ooa-control-height-sm, 24px); padding-inline: var(--ooa-btn-padding-inline-sm, 7px); font-size: var(--ooa-btn-content-font-size-sm, 14px); }
  button.ooa-btn-lg { height: var(--ooa-control-height-lg, 40px); padding-inline: var(--ooa-btn-padding-inline-lg, 15px); font-size: var(--ooa-btn-content-font-size-lg, 16px); }

  /* icon-only 方钮 */
  button.ooa-btn-icon-only { min-width: var(--ooa-control-height, 32px); padding-inline: 0; }

  /* block */
  :host([block]) button { width: 100%; }

  /* loading（对位 antd genSharedButtonStyle：loading 时降透明度） */
  button.ooa-btn-loading { cursor: default; opacity: var(--ooa-opacity-loading, 0.65); }
  .ooa-btn-spin { animation: ooa-btn-spin 0.8s linear infinite; }
  @keyframes ooa-btn-spin { to { transform: rotate(360deg); } }

  /* 两汉字 */
  button.ooa-btn-two-chinese-chars { letter-spacing: 0.3em; }
  button.ooa-btn-two-chinese-chars::after { content: ''; letter-spacing: 0; margin-inline-end: -0.3em; }

  /* icon end */
  button.ooa-btn-icon-end { flex-direction: row-reverse; }
`;
