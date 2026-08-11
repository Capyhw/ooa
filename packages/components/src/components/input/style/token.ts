import { css } from 'lit';

/**
 * 对位 antd Input prepareComponentToken + initInputToken：全局 token → --ooa-input-* 组件变量。
 * antd 的 padding* 由 JS 计算（round((controlHeight - fontSize*lineHeight)/2,1) - lineWidth），
 * 这里用 CSS calc + max() 表达同一公式，值跟随全局 token，可被主题覆盖。
 * 已用 parity 页面实测核对：middle `4px 11px` / small `0px 7px` / large `7px 11px`，字号 14/14/16。
 */
export const inputTokens = css`
  :host {
    /* padding block（对位 antd initComponentToken paddingBlock*） */
    --ooa-input-padding-block: max(0px, calc((var(--ooa-control-height, 32px) - var(--ooa-font-size, 14px) * var(--ooa-line-height, 1.5714)) / 2 - var(--ooa-line-width, 1px)));
    --ooa-input-padding-block-sm: max(0px, calc((var(--ooa-control-height-sm, 24px) - var(--ooa-font-size, 14px) * var(--ooa-line-height, 1.5714)) / 2 - var(--ooa-line-width, 1px)));
    --ooa-input-padding-block-lg: max(0px, calc((var(--ooa-control-height-lg, 40px) - var(--ooa-font-size-lg, 16px) * var(--ooa-line-height-lg, 1.5)) / 2 - var(--ooa-line-width, 1px)));
    /* padding inline（对位 paddingSM / controlPaddingHorizontal* - lineWidth） */
    --ooa-input-padding-inline: calc(var(--ooa-padding-sm, 12px) - var(--ooa-line-width, 1px));
    --ooa-input-padding-inline-sm: calc(var(--ooa-control-padding-horizontal-sm, 8px) - var(--ooa-line-width, 1px));
    --ooa-input-padding-inline-lg: calc(var(--ooa-control-padding-horizontal, 12px) - var(--ooa-line-width, 1px));
    /* 字号（对位 inputFontSize*：sm 回退 mergedFontSize，lg 回退 fontSizeLG） */
    --ooa-input-font-size: var(--ooa-font-size, 14px);
    --ooa-input-font-size-lg: var(--ooa-font-size-lg, 16px);
    --ooa-input-font-size-sm: var(--ooa-font-size, 14px);
    /* affix 间距（对位 initInputToken inputAffixPadding = paddingXXS） */
    --ooa-input-affix-padding: var(--ooa-padding-xxs, 4px);
    /* addon 背景（对位 addonBg = colorFillAlter） */
    --ooa-input-addon-bg: var(--ooa-color-fill-alter, rgba(0, 0, 0, 0.02));
    /* focus / hover（对位 activeBorderColor / hoverBorderColor / activeShadow*） */
    --ooa-input-hover-border-color: var(--ooa-color-primary-hover, #4096ff);
    --ooa-input-active-border-color: var(--ooa-color-primary, #1677ff);
    --ooa-input-active-shadow: 0 0 0 var(--ooa-control-outline-width, 2px) var(--ooa-control-outline, rgba(5, 145, 255, 0.1));
    --ooa-input-error-active-shadow: 0 0 0 var(--ooa-control-outline-width, 2px) var(--ooa-color-error-outline, rgba(255, 38, 5, 0.06));
    --ooa-input-warning-active-shadow: 0 0 0 var(--ooa-control-outline-width, 2px) var(--ooa-color-warning-outline, rgba(255, 215, 5, 0.1));
    /* 组件内图标字号（对位 colorTextQuaternary 的 clear-icon 等） */
    --ooa-input-icon-size: var(--ooa-font-size-icon, 12px);
  }
`;
