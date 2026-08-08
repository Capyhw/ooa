import { css } from 'lit';

/** 对位 antd Button prepareComponentToken：全局 token → --ooa-btn-* 组件变量。 */
export const buttonTokens = css`
  :host {
    /* 布局尺寸 */
    --ooa-btn-padding-inline: calc(var(--ooa-padding-content-horizontal, 15px) - var(--ooa-line-width, 1px));
    --ooa-btn-padding-inline-sm: calc(8px - var(--ooa-line-width, 1px));
    --ooa-btn-padding-inline-lg: calc(var(--ooa-padding-content-horizontal, 15px) - var(--ooa-line-width, 1px));
    --ooa-btn-content-font-size: var(--ooa-font-size, 14px);
    --ooa-btn-content-font-size-sm: var(--ooa-font-size, 14px);
    --ooa-btn-content-font-size-lg: var(--ooa-font-size-lg, 16px);
    --ooa-btn-content-line-height: 1.5714;
    --ooa-btn-icon-gap: var(--ooa-margin-xs, 8px);
    --ooa-btn-only-icon-size: inherit;
    --ooa-btn-only-icon-size-sm: inherit;
    --ooa-btn-only-icon-size-lg: inherit;

    /* 阴影（0 outline-width 0 outline色） */
    --ooa-btn-default-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-control-tmp-outline, rgba(0, 0, 0, 0.02));
    --ooa-btn-primary-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-control-outline, rgba(5, 145, 255, 0.1));
    --ooa-btn-danger-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-color-error-outline, rgba(255, 38, 5, 0.06));
    --ooa-btn-blue-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-blue-1, #e6f4ff);
    --ooa-btn-purple-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-purple-1, #f9f0ff);
    --ooa-btn-cyan-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-cyan-1, #e6fffb);
    --ooa-btn-green-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-green-1, #f6ffed);
    --ooa-btn-magenta-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-magenta-1, #fff0f6);
    --ooa-btn-pink-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-pink-1, #fff0f6);
    --ooa-btn-red-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-red-1, #fff1f0);
    --ooa-btn-orange-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-orange-1, #fff7e6);
    --ooa-btn-yellow-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-yellow-1, #feffe6);
    --ooa-btn-volcano-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-volcano-1, #fff2e8);
    --ooa-btn-geekblue-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-geekblue-1, #f0f5ff);
    --ooa-btn-lime-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-lime-1, #fcffe6);
    --ooa-btn-gold-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-gold-1, #fffbe6);

    /* solid 文字色：color-contrast() 在所有浏览器未实现，改为由 ooa-button 在 JS 侧按
       isBright 计算后内联到宿主 --ooa-btn-solid-text-color（对位 antd solidTextColor）。
       此处仅声明默认值供 JS 未接管时兜底。 */
    --ooa-btn-solid-text-color: var(--ooa-color-text-light-solid, #fff);

    /* text / link 相关 */
    --ooa-btn-text-text-color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-text-color-hover: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-text-color-active: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-hover-bg: var(--ooa-color-fill-tertiary, rgba(0, 0, 0, 0.04));
    --ooa-btn-link-hover-bg: transparent;

    /* ghost */
    --ooa-btn-default-ghost-color: var(--ooa-color-bg-container, #fff);
    --ooa-btn-default-ghost-border-color: var(--ooa-color-bg-container, #fff);
    --ooa-btn-ghost-bg: transparent;

    /* group */
    --ooa-btn-group-border-color: var(--ooa-color-primary-hover, #4096ff);
  }
`;
