import { css } from 'lit';

/**
 * 对位 antd Button style/variant.js 的双轴（variant × color）CSS 变量系统。
 * antd 用 class 选择器（.ant-btn-variant-solid 等），这里用宿主属性选择器
 * :host([variant="..."]) / :host([color="..."]) / :host([danger]) / :host([ghost])，
 * 结构逐段保持一致：变量声明 → 模板 → variant → color（link/primary/danger/default/预设色）→ disabled → ghost。
 * 所有颜色值一律 var(--ooa-*) + antd 兜底，不写死任何颜色。
 */
export const buttonVariantStyles = css`
  /* ===== 变量声明（:host 兜底，值经 CSS 变量继承进入内部 button） ===== */
  :host {
    /* Border */
    --ooa-btn-border-width: var(--ooa-line-width, 1px);
    --ooa-btn-border-color: var(--ooa-color-text, #000);
    --ooa-btn-border-color-hover: var(--ooa-btn-border-color);
    --ooa-btn-border-color-active: var(--ooa-btn-border-color);
    --ooa-btn-border-color-disabled: var(--ooa-btn-border-color);
    --ooa-btn-border-style: solid;
    /* Text */
    --ooa-btn-text-color: var(--ooa-color-text, #000);
    --ooa-btn-text-color-hover: var(--ooa-btn-text-color);
    --ooa-btn-text-color-active: var(--ooa-btn-text-color);
    --ooa-btn-text-color-disabled: var(--ooa-btn-text-color);
    /* Background */
    --ooa-btn-bg-color: var(--ooa-color-fill-secondary, #ddd);
    --ooa-btn-bg-color-hover: var(--ooa-btn-bg-color);
    --ooa-btn-bg-color-active: var(--ooa-btn-bg-color);
    --ooa-btn-bg-color-disabled: var(--ooa-color-bg-container-disabled, rgba(0, 0, 0, 0.04));
    --ooa-btn-bg-color-container: var(--ooa-color-bg-container, #fff);
    /* Color 轴（由颜色段覆盖，兜底取 antd 中性值） */
    --ooa-btn-color-base: var(--ooa-color-text, #000);
    --ooa-btn-color-hover: var(--ooa-color-text, #000);
    --ooa-btn-color-active: var(--ooa-color-text, #000);
    --ooa-btn-color-light: var(--ooa-color-fill-tertiary, rgba(0, 0, 0, 0.04));
    --ooa-btn-color-light-hover: var(--ooa-color-fill-secondary, rgba(0, 0, 0, 0.06));
    --ooa-btn-color-light-active: var(--ooa-color-fill, rgba(0, 0, 0, 0.15));
    --ooa-btn-solid-bg-color: var(--ooa-color-bg-solid, #000);
    --ooa-btn-solid-bg-color-hover: var(--ooa-color-bg-solid-hover, rgba(0, 0, 0, 0.75));
    --ooa-btn-solid-bg-color-active: var(--ooa-color-bg-solid-active, rgba(0, 0, 0, 0.95));
    /* Shadow */
    --ooa-btn-shadow: none;
  }

  /* ===== 模板（应用到内部 button，对位 antd 模板段） ===== */
  button {
    border: var(--ooa-btn-border-width) var(--ooa-btn-border-style) var(--ooa-btn-border-color);
    color: var(--ooa-btn-text-color);
    background-color: var(--ooa-btn-bg-color);
  }
  button:hover:not(:disabled) {
    border-color: var(--ooa-btn-border-color-hover);
    color: var(--ooa-btn-text-color-hover);
    background-color: var(--ooa-btn-bg-color-hover);
  }
  button:active:not(:disabled) {
    border-color: var(--ooa-btn-border-color-active);
    color: var(--ooa-btn-text-color-active);
    background-color: var(--ooa-btn-bg-color-active);
  }
  button:focus-visible {
    outline: var(--ooa-control-outline-width, 2px) solid var(--ooa-color-primary-border, #91caff);
    outline-offset: 1px;
  }

  /* ===== Variants（只覆盖变量） ===== */
  /* >>>>> Solid */
  :host([variant="solid"]) {
    --ooa-btn-solid-bg-color: var(--ooa-btn-color-base);
    --ooa-btn-solid-bg-color-hover: var(--ooa-btn-color-hover);
    --ooa-btn-solid-bg-color-active: var(--ooa-btn-color-active);
    --ooa-btn-border-color: transparent;
    --ooa-btn-text-color: var(--ooa-btn-solid-text-color);
    --ooa-btn-bg-color: var(--ooa-btn-solid-bg-color);
    --ooa-btn-bg-color-hover: var(--ooa-btn-solid-bg-color-hover);
    --ooa-btn-bg-color-active: var(--ooa-btn-solid-bg-color-active);
  }
  :host([variant="solid"]) button {
    box-shadow: var(--ooa-btn-shadow);
  }
  /* >>>>> Outlined & Dashed */
  :host([variant="outlined"]),
  :host([variant="dashed"]) {
    --ooa-btn-border-color: var(--ooa-btn-color-base);
    --ooa-btn-border-color-hover: var(--ooa-btn-color-hover);
    --ooa-btn-border-color-active: var(--ooa-btn-color-active);
    --ooa-btn-bg-color: var(--ooa-btn-bg-color-container);
    --ooa-btn-text-color: var(--ooa-btn-color-base);
    --ooa-btn-text-color-hover: var(--ooa-btn-color-hover);
    --ooa-btn-text-color-active: var(--ooa-btn-color-active);
  }
  :host([variant="outlined"]) button,
  :host([variant="dashed"]) button {
    box-shadow: var(--ooa-btn-shadow);
  }
  /* >>>>> Dashed */
  :host([variant="dashed"]) {
    --ooa-btn-border-style: dashed;
    --ooa-btn-bg-color-disabled: var(--ooa-color-bg-container-disabled, rgba(0, 0, 0, 0.04));
  }
  /* >>>>> Filled */
  :host([variant="filled"]) {
    --ooa-btn-border-color: transparent;
    --ooa-btn-text-color: var(--ooa-btn-color-base);
    --ooa-btn-bg-color: var(--ooa-btn-color-light);
    --ooa-btn-bg-color-hover: var(--ooa-btn-color-light-hover);
    --ooa-btn-bg-color-active: var(--ooa-btn-color-light-active);
  }
  /* >>>>> Text & Link */
  :host([variant="text"]),
  :host([variant="link"]) {
    --ooa-btn-border-color: transparent;
    --ooa-btn-border-color-hover: transparent;
    --ooa-btn-border-color-active: transparent;
    --ooa-btn-border-color-disabled: transparent;
    --ooa-btn-text-color: var(--ooa-btn-color-base);
    --ooa-btn-text-color-hover: var(--ooa-btn-color-hover);
    --ooa-btn-text-color-active: var(--ooa-btn-color-active);
    --ooa-btn-bg-color: transparent;
    --ooa-btn-bg-color-hover: transparent;
    --ooa-btn-bg-color-active: transparent;
  }
  :host([variant="text"]) button:disabled,
  :host([variant="link"]) button:disabled {
    background: transparent;
    border-color: transparent;
  }
  /* >>>>> Text */
  :host([variant="text"]) {
    --ooa-btn-bg-color-hover: var(--ooa-btn-color-light);
    --ooa-btn-bg-color-active: var(--ooa-btn-color-light-active);
  }

  /* ===== Colors（对位 antd 颜色段） ===== */
  /* >>>>> Link（variant link 的默认色） */
  :host([variant="link"]) {
    --ooa-btn-color-base: var(--ooa-color-link, #1677ff);
    --ooa-btn-color-hover: var(--ooa-color-link-hover, #69b1ff);
    --ooa-btn-color-active: var(--ooa-color-link-active, #0958d9);
    --ooa-btn-bg-color-hover: var(--ooa-btn-link-hover-bg, transparent);
  }
  /* >>>>> Primary */
  :host([color="primary"]) {
    --ooa-btn-color-base: var(--ooa-color-primary, #1677ff);
    --ooa-btn-color-hover: var(--ooa-color-primary-hover, #4096ff);
    --ooa-btn-color-active: var(--ooa-color-primary-active, #0958d9);
    --ooa-btn-color-light: var(--ooa-color-primary-bg, #e6f4ff);
    --ooa-btn-color-light-hover: var(--ooa-color-primary-bg-hover, #bae0ff);
    --ooa-btn-color-light-active: var(--ooa-color-primary-border, #91caff);
    --ooa-btn-shadow: var(--ooa-btn-primary-shadow);
  }
  :host([color="primary"][variant="solid"]) {
    --ooa-btn-text-color: var(--ooa-color-text-light-solid, #fff);
    --ooa-btn-text-color-hover: var(--ooa-btn-text-color);
    --ooa-btn-text-color-active: var(--ooa-btn-text-color);
  }
  /* >>>>> Danger */
  :host([danger]) {
    --ooa-btn-color-base: var(--ooa-color-error, #ff4d4f);
    --ooa-btn-color-hover: var(--ooa-color-error-hover, #ff7875);
    --ooa-btn-color-active: var(--ooa-color-error-active, #d9363e);
    --ooa-btn-color-light: var(--ooa-color-error-bg, #fff2f0);
    --ooa-btn-color-light-hover: var(--ooa-color-error-bg-filled-hover, #ffdfdc);
    --ooa-btn-color-light-active: var(--ooa-color-error-bg-active, #ffccc7);
    --ooa-btn-shadow: var(--ooa-btn-danger-shadow);
  }
  :host([danger][variant="solid"]) {
    --ooa-btn-text-color: var(--ooa-color-text-light-solid, #fff);
    --ooa-btn-text-color-hover: var(--ooa-btn-text-color);
    --ooa-btn-text-color-active: var(--ooa-btn-text-color);
  }
  /* >>>>> Default */
  :host([color="default"]) {
    --ooa-btn-solid-bg-color: var(--ooa-color-bg-solid, #000);
    --ooa-btn-solid-bg-color-hover: var(--ooa-color-bg-solid-hover, rgba(0, 0, 0, 0.75));
    --ooa-btn-solid-bg-color-active: var(--ooa-color-bg-solid-active, rgba(0, 0, 0, 0.95));
    --ooa-btn-color-base: var(--ooa-color-border, #d9d9d9);
    --ooa-btn-color-hover: var(--ooa-color-primary-hover, #4096ff);
    --ooa-btn-color-active: var(--ooa-color-primary-active, #0958d9);
    --ooa-btn-color-light: var(--ooa-color-fill-tertiary, rgba(0, 0, 0, 0.04));
    --ooa-btn-color-light-hover: var(--ooa-color-fill-secondary, rgba(0, 0, 0, 0.06));
    --ooa-btn-color-light-active: var(--ooa-color-fill, rgba(0, 0, 0, 0.15));
    --ooa-btn-text-color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-color-hover: var(--ooa-color-primary-hover, #4096ff);
    --ooa-btn-text-color-active: var(--ooa-color-primary-active, #0958d9);
    --ooa-btn-shadow: var(--ooa-btn-default-shadow);
  }
  :host([color="default"][variant="outlined"]) {
    --ooa-btn-bg-color-disabled: var(--ooa-color-bg-container-disabled, rgba(0, 0, 0, 0.04));
  }
  :host([color="default"][variant="solid"]) {
    --ooa-btn-text-color: var(--ooa-btn-solid-text-color);
    --ooa-btn-text-color-hover: var(--ooa-btn-text-color);
    --ooa-btn-text-color-active: var(--ooa-btn-text-color);
  }
  :host([color="default"][variant="filled"]),
  :host([color="default"][variant="text"]) {
    --ooa-btn-text-color-hover: var(--ooa-btn-text-color);
    --ooa-btn-text-color-active: var(--ooa-btn-text-color);
  }
  :host([color="default"][variant="outlined"]),
  :host([color="default"][variant="dashed"]) {
    --ooa-btn-text-color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-color-hover: var(--ooa-color-primary-hover, #4096ff);
    --ooa-btn-text-color-active: var(--ooa-color-primary-active, #0958d9);
    --ooa-btn-bg-color-container: var(--ooa-color-bg-container, #fff);
    --ooa-btn-bg-color-hover: var(--ooa-color-bg-container, #fff);
    --ooa-btn-bg-color-active: var(--ooa-color-bg-container, #fff);
  }
  :host([color="default"][variant="text"]) {
    --ooa-btn-text-color: var(--ooa-btn-text-text-color);
    --ooa-btn-text-color-hover: var(--ooa-btn-text-text-color-hover);
    --ooa-btn-text-color-active: var(--ooa-btn-text-text-color-active);
    --ooa-btn-bg-color-hover: var(--ooa-btn-text-hover-bg);
  }
  :host([color="default"][ghost][variant="outlined"]),
  :host([color="default"][ghost][variant="dashed"]) {
    --ooa-btn-text-color: var(--ooa-btn-default-ghost-color);
    --ooa-btn-border-color: var(--ooa-btn-default-ghost-border-color);
  }
  /* >>>>> 13 预设色（对位 antd PresetColors.map） */
  :host([color="blue"]) {
    --ooa-btn-color-base: var(--ooa-blue, #1677ff);
    --ooa-btn-color-hover: var(--ooa-blue-hover, #4096ff);
    --ooa-btn-color-active: var(--ooa-blue-active, #0958d9);
    --ooa-btn-color-light: var(--ooa-blue-1, #e6f4ff);
    --ooa-btn-color-light-hover: var(--ooa-blue-2, #bae0ff);
    --ooa-btn-color-light-active: var(--ooa-blue-3, #91caff);
    --ooa-btn-shadow: var(--ooa-btn-blue-shadow);
  }
  :host([color="purple"]) {
    --ooa-btn-color-base: var(--ooa-purple, #722ed1);
    --ooa-btn-color-hover: var(--ooa-purple-hover, #9254de);
    --ooa-btn-color-active: var(--ooa-purple-active, #531dab);
    --ooa-btn-color-light: var(--ooa-purple-1, #f9f0ff);
    --ooa-btn-color-light-hover: var(--ooa-purple-2, #efdbff);
    --ooa-btn-color-light-active: var(--ooa-purple-3, #d3adf7);
    --ooa-btn-shadow: var(--ooa-btn-purple-shadow);
  }
  :host([color="cyan"]) {
    --ooa-btn-color-base: var(--ooa-cyan, #13c2c2);
    --ooa-btn-color-hover: var(--ooa-cyan-hover, #36cfc9);
    --ooa-btn-color-active: var(--ooa-cyan-active, #08979c);
    --ooa-btn-color-light: var(--ooa-cyan-1, #e6fffb);
    --ooa-btn-color-light-hover: var(--ooa-cyan-2, #b5f5ec);
    --ooa-btn-color-light-active: var(--ooa-cyan-3, #87e8de);
    --ooa-btn-shadow: var(--ooa-btn-cyan-shadow);
  }
  :host([color="green"]) {
    --ooa-btn-color-base: var(--ooa-green, #52c41a);
    --ooa-btn-color-hover: var(--ooa-green-hover, #73d13d);
    --ooa-btn-color-active: var(--ooa-green-active, #389e0d);
    --ooa-btn-color-light: var(--ooa-green-1, #f6ffed);
    --ooa-btn-color-light-hover: var(--ooa-green-2, #d9f7be);
    --ooa-btn-color-light-active: var(--ooa-green-3, #b7eb8f);
    --ooa-btn-shadow: var(--ooa-btn-green-shadow);
  }
  :host([color="magenta"]) {
    --ooa-btn-color-base: var(--ooa-magenta, #eb2f96);
    --ooa-btn-color-hover: var(--ooa-magenta-hover, #f759ab);
    --ooa-btn-color-active: var(--ooa-magenta-active, #c41d7f);
    --ooa-btn-color-light: var(--ooa-magenta-1, #fff0f6);
    --ooa-btn-color-light-hover: var(--ooa-magenta-2, #ffd6e7);
    --ooa-btn-color-light-active: var(--ooa-magenta-3, #ffadd2);
    --ooa-btn-shadow: var(--ooa-btn-magenta-shadow);
  }
  :host([color="pink"]) {
    --ooa-btn-color-base: var(--ooa-pink, #eb2f96);
    --ooa-btn-color-hover: var(--ooa-pink-hover, #f759ab);
    --ooa-btn-color-active: var(--ooa-pink-active, #c41d7f);
    --ooa-btn-color-light: var(--ooa-pink-1, #fff0f6);
    --ooa-btn-color-light-hover: var(--ooa-pink-2, #ffd6e7);
    --ooa-btn-color-light-active: var(--ooa-pink-3, #ffadd2);
    --ooa-btn-shadow: var(--ooa-btn-pink-shadow);
  }
  :host([color="red"]) {
    --ooa-btn-color-base: var(--ooa-red, #f5222d);
    --ooa-btn-color-hover: var(--ooa-red-hover, #ff4d4f);
    --ooa-btn-color-active: var(--ooa-red-active, #cf1322);
    --ooa-btn-color-light: var(--ooa-red-1, #fff1f0);
    --ooa-btn-color-light-hover: var(--ooa-red-2, #ffccc7);
    --ooa-btn-color-light-active: var(--ooa-red-3, #ffa39e);
    --ooa-btn-shadow: var(--ooa-btn-red-shadow);
  }
  :host([color="orange"]) {
    --ooa-btn-color-base: var(--ooa-orange, #fa8c16);
    --ooa-btn-color-hover: var(--ooa-orange-hover, #ffa940);
    --ooa-btn-color-active: var(--ooa-orange-active, #d46b08);
    --ooa-btn-color-light: var(--ooa-orange-1, #fff7e6);
    --ooa-btn-color-light-hover: var(--ooa-orange-2, #ffe7ba);
    --ooa-btn-color-light-active: var(--ooa-orange-3, #ffd591);
    --ooa-btn-shadow: var(--ooa-btn-orange-shadow);
  }
  :host([color="yellow"]) {
    --ooa-btn-color-base: var(--ooa-yellow, #fadb14);
    --ooa-btn-color-hover: var(--ooa-yellow-hover, #ffec3d);
    --ooa-btn-color-active: var(--ooa-yellow-active, #d4b106);
    --ooa-btn-color-light: var(--ooa-yellow-1, #feffe6);
    --ooa-btn-color-light-hover: var(--ooa-yellow-2, #ffffb8);
    --ooa-btn-color-light-active: var(--ooa-yellow-3, #fffb8f);
    --ooa-btn-shadow: var(--ooa-btn-yellow-shadow);
  }
  :host([color="volcano"]) {
    --ooa-btn-color-base: var(--ooa-volcano, #fa541c);
    --ooa-btn-color-hover: var(--ooa-volcano-hover, #ff7a45);
    --ooa-btn-color-active: var(--ooa-volcano-active, #d4380d);
    --ooa-btn-color-light: var(--ooa-volcano-1, #fff2e8);
    --ooa-btn-color-light-hover: var(--ooa-volcano-2, #ffd8bf);
    --ooa-btn-color-light-active: var(--ooa-volcano-3, #ffbb96);
    --ooa-btn-shadow: var(--ooa-btn-volcano-shadow);
  }
  :host([color="geekblue"]) {
    --ooa-btn-color-base: var(--ooa-geekblue, #2f54eb);
    --ooa-btn-color-hover: var(--ooa-geekblue-hover, #597ef7);
    --ooa-btn-color-active: var(--ooa-geekblue-active, #1d39c4);
    --ooa-btn-color-light: var(--ooa-geekblue-1, #f0f5ff);
    --ooa-btn-color-light-hover: var(--ooa-geekblue-2, #d6e4ff);
    --ooa-btn-color-light-active: var(--ooa-geekblue-3, #adc6ff);
    --ooa-btn-shadow: var(--ooa-btn-geekblue-shadow);
  }
  :host([color="lime"]) {
    --ooa-btn-color-base: var(--ooa-lime, #a0d911);
    --ooa-btn-color-hover: var(--ooa-lime-hover, #bae637);
    --ooa-btn-color-active: var(--ooa-lime-active, #7cb305);
    --ooa-btn-color-light: var(--ooa-lime-1, #fcffe6);
    --ooa-btn-color-light-hover: var(--ooa-lime-2, #f4ffb8);
    --ooa-btn-color-light-active: var(--ooa-lime-3, #eaff8f);
    --ooa-btn-shadow: var(--ooa-btn-lime-shadow);
  }
  :host([color="gold"]) {
    --ooa-btn-color-base: var(--ooa-gold, #faad14);
    --ooa-btn-color-hover: var(--ooa-gold-hover, #ffc53d);
    --ooa-btn-color-active: var(--ooa-gold-active, #d48806);
    --ooa-btn-color-light: var(--ooa-gold-1, #fffbe6);
    --ooa-btn-color-light-hover: var(--ooa-gold-2, #fff1b8);
    --ooa-btn-color-light-active: var(--ooa-gold-3, #ffe58f);
    --ooa-btn-shadow: var(--ooa-btn-gold-shadow);
  }

  /* ===== Disabled（对位 antd &*:disabled, &-disabled） ===== */
  button:disabled {
    cursor: not-allowed;
    border-color: var(--ooa-color-border-disabled, #d9d9d9);
    background: var(--ooa-btn-bg-color-disabled);
    color: var(--ooa-color-text-disabled, rgba(0, 0, 0, 0.25));
    box-shadow: none;
  }

  /* ===== Ghost（对位 antd &-background-ghost） ===== */
  :host([ghost]) {
    --ooa-btn-bg-color: var(--ooa-btn-ghost-bg, transparent);
    --ooa-btn-bg-color-hover: var(--ooa-btn-ghost-bg, transparent);
    --ooa-btn-bg-color-active: var(--ooa-btn-ghost-bg, transparent);
    --ooa-btn-shadow: none;
  }
  :host([ghost][variant="outlined"]),
  :host([ghost][variant="dashed"]) {
    --ooa-btn-bg-color-hover: var(--ooa-btn-ghost-bg, transparent);
    --ooa-btn-bg-color-active: var(--ooa-btn-ghost-bg, transparent);
  }
`;
