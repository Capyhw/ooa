import { css } from 'lit';

/**
 * 组样式（对位 antd style/group.js）：相邻按钮边框合并、首尾圆角清零、hover z-index 抬升。
 * 子元素是自定义元素 <ooa-button>，用 ::slotted 命中宿主；圆角经 CSS 变量桥接进
 * ooa-button 的 shadow（::slotted() 无法 ::part() 深入其内部 button），shape-size.ts 消费
 * --ooa-btn-group-start/end-radius；margin 负边框宽直接加在宿主上实现边框合并。
 */
export const buttonGroupStyles = css`
  .ooa-btn-group {
    position: relative;
    display: inline-flex;
  }
  .ooa-btn-group ::slotted(ooa-button) {
    position: relative;
    z-index: 1;
  }
  .ooa-btn-group ::slotted(ooa-button:hover) {
    z-index: 2;
  }
  .ooa-btn-group ::slotted(ooa-button[disabled]) {
    z-index: 0;
  }
  .ooa-btn-group ::slotted(ooa-button:not(:last-child)) {
    --ooa-btn-group-end-radius: 0px;
  }
  .ooa-btn-group ::slotted(ooa-button:not(:first-child)) {
    margin-inline-start: calc(-1 * var(--ooa-line-width, 1px));
    --ooa-btn-group-start-radius: 0px;
  }
`;
