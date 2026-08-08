import { css } from 'lit';

/** 布局/形状/尺寸/block/loading/icon-only/两汉字 等共享规则（对位 antd genSharedButtonStyle 等）。 */
export const buttonShapeSizeStyles = css`
  :host { display: inline-block; }
  :host([block]) { display: block; }

  /* .ooa-btn 标签无关：<button> 与 anchor 分支（<a class="ooa-btn">）共用外观 */
  .ooa-btn {
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
    /* 圆角分边声明，供按钮组（style/group.ts）经 --ooa-btn-group-start/end-radius
       CSS 变量桥接清零（::slotted() 无法 ::part() 深入 shadow） */
    border-start-start-radius: var(--ooa-btn-group-start-radius, var(--ooa-border-radius, 6px));
    border-start-end-radius: var(--ooa-btn-group-end-radius, var(--ooa-border-radius, 6px));
    border-end-start-radius: var(--ooa-btn-group-start-radius, var(--ooa-border-radius, 6px));
    border-end-end-radius: var(--ooa-btn-group-end-radius, var(--ooa-border-radius, 6px));
    outline: none;
    user-select: none;
    touch-action: manipulation;
    transition: color var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      border-color var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      background var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      box-shadow var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease);
  }

  /* 形状（shape 是宿主属性） */
  :host([shape="round"]) .ooa-btn { border-radius: 999px; }
  :host([shape="circle"]) .ooa-btn { min-width: var(--ooa-control-height, 32px); padding-inline: 0; border-radius: 50%; }
  :host([shape="square"]) .ooa-btn { min-width: var(--ooa-control-height, 32px); padding-inline: 0; }

  /* 尺寸：类加在内部 button/a 上（对齐 antd DOM） */
  .ooa-btn.ooa-btn-sm { height: var(--ooa-control-height-sm, 24px); padding-inline: var(--ooa-btn-padding-inline-sm, 7px); font-size: var(--ooa-btn-content-font-size-sm, 14px); }
  .ooa-btn.ooa-btn-lg { height: var(--ooa-control-height-lg, 40px); padding-inline: var(--ooa-btn-padding-inline-lg, 15px); font-size: var(--ooa-btn-content-font-size-lg, 16px); }

  /* icon-only 方钮 */
  .ooa-btn.ooa-btn-icon-only { min-width: var(--ooa-control-height, 32px); padding-inline: 0; }

  /* block */
  :host([block]) .ooa-btn { width: 100%; }

  /* loading（对位 antd genSharedButtonStyle：loading 时降透明度） */
  .ooa-btn.ooa-btn-loading { cursor: default; opacity: var(--ooa-opacity-loading, 0.65); }
  .ooa-btn-spin { animation: ooa-btn-spin 0.8s linear infinite; }
  @keyframes ooa-btn-spin { to { transform: rotate(360deg); } }

  /* 两汉字 */
  .ooa-btn.ooa-btn-two-chinese-chars { letter-spacing: 0.3em; }
  .ooa-btn.ooa-btn-two-chinese-chars::after { content: ''; letter-spacing: 0; margin-inline-end: -0.3em; }

  /* icon end */
  .ooa-btn.ooa-btn-icon-end { flex-direction: row-reverse; }

  /* icon 位：空且非 loading 时隐藏 wrapper（避免空 span 的 gap 顶开文字）；
     loading 时隐藏 icon slot、显示 loading-icon slot（对位 antd 替换 iconNode） */
  .ooa-btn-icon { display: inline-flex; }
  .ooa-btn-icon-hidden { display: none; }
  slot[name="loading-icon"] { display: none; }
  .ooa-btn.ooa-btn-loading slot[name="icon"] { display: none; }
  .ooa-btn.ooa-btn-loading slot[name="loading-icon"] { display: inline; }
`;
