import { createElement, type ReactNode } from 'react';
import { Button as AntButton, type ButtonProps } from 'antd';
import { OoaButton, DemoBlock } from './shared';
import type { ParityCase, SurfaceName } from './types';

/**
 * 对比示例对齐 antd 官网 button 文档（https://ant.design/components/button-cn）的 demo 结构：
 * 每个官网 demo 一个 DemoBlock，标题沿用官网中文名；按钮集合、顺序与 props 照搬官网。
 *
 * 官网 demo 里依赖 OOA 没有的辅助组件（Tooltip / Radio.Group / Divider / Dropdown /
 * Space.Compact / Flex / antd-style）的部分一律省略，只保留按钮本身做 1:1 视觉对比：
 * - icon demo 的 Tooltip 省略
 * - icon-placement / size demo 的 Radio 切换改为静态 start/end、large/medium/small 多行
 * - loading demo 的点击交互改为静态 loading 展示
 * - multiple demo 的 Space.Compact + Dropdown 用 Button.Group 占位
 *
 * size / disabled 仍由外层 antd ConfigProvider 与 ooa-config-provider 全局下发，
 * 因此这里只演示按钮级语义（type / color / variant / danger / ghost / block / loading /
 * shape / icon / icon-placement / href / autoInsertSpace），与全局配置正交。
 */

const VARIANT_ORDER = ['solid', 'outlined', 'dashed', 'filled', 'text', 'link'] as const;
const VARIANT_LABEL: Record<string, string> = {
  solid: 'Solid',
  outlined: 'Outlined',
  dashed: 'Dashed',
  filled: 'Filled',
  text: 'Text',
  link: 'Link',
};
const COLOR_ROWS = ['default', 'primary', 'danger', 'pink', 'purple', 'cyan'] as const;
const SIZES = ['large', 'medium', 'small'] as const;

/** 两侧属性名差异：ooa 走 kebab-case 属性，antd 走 camelCase prop。 */
const placementProp = (surface: SurfaceName, value: 'start' | 'end') =>
  surface === 'ooa' ? { 'icon-placement': value } : { iconPlacement: value };

const autoSpaceProp = (surface: SurfaceName, value: boolean) =>
  surface === 'ooa' ? { 'auto-insert-space': value } : { autoInsertSpace: value };

/** 简单文字/任意子节点按钮的通用渲染（官网 demo 用）。 */
function renderBtn(surface: SurfaceName, props: Record<string, unknown>, children: ReactNode): ReactNode {
  return surface === 'ooa'
    ? OoaButton(props, children)
    : createElement(AntButton, props as ButtonProps, children);
}

/** 带图标的按钮：ooa 走 icon slot，antd 走 icon prop。 */
function iconBtn(surface: SurfaceName, props: Record<string, unknown>, icon: string, text?: ReactNode): ReactNode {
  if (surface === 'ooa') {
    const children: ReactNode[] = [createElement('span', { slot: 'icon' }, icon)];
    if (text) children.push(text);
    return createElement('ooa-button', props, ...children);
  }
  return createElement(AntButton, { ...(props as ButtonProps), icon: createElement('span', null, icon) }, text);
}

/** 自定义 loading 图标（对位官网 loading={{ icon: <SyncOutlined spin /> }}）。 */
function loadingIconBtn(surface: SurfaceName, text: string): ReactNode {
  const spin = createElement('span', { className: 'demo-spin' }, '↻');
  if (surface === 'ooa') {
    return createElement(
      'ooa-button',
      { type: 'primary', loading: true },
      createElement('span', { slot: 'loading-icon' }, spin),
      text,
    );
  }
  return createElement(AntButton, { type: 'primary', loading: { icon: spin } }, text);
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="demo-row">
      <span className="demo-row-label">{label}</span>
      {children}
    </div>
  );
}

function TypeCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="语法糖 type">
      <div className="demo-row">
        {renderBtn(surface, { type: 'primary' }, 'Primary Button')}
        {renderBtn(surface, {}, 'Default Button')}
        {renderBtn(surface, { type: 'dashed' }, 'Dashed Button')}
        {renderBtn(surface, { type: 'text' }, 'Text Button')}
        {renderBtn(surface, { type: 'link' }, 'Link Button')}
      </div>
    </DemoBlock>
  );
}

function ColorVariantCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="颜色与变体 color × variant">
      {COLOR_ROWS.map((color) => (
        <div className="demo-row" key={color}>
          {VARIANT_ORDER.map((variant) => renderBtn(surface, { color, variant }, VARIANT_LABEL[variant]))}
        </div>
      ))}
    </DemoBlock>
  );
}

function IconCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="按钮图标 icon">
      <div className="demo-row">
        {iconBtn(surface, { type: 'primary', shape: 'circle' }, '★')}
        {renderBtn(surface, { type: 'primary', shape: 'circle' }, 'A')}
        {iconBtn(surface, { type: 'primary' }, '★', 'Search')}
        {iconBtn(surface, { shape: 'circle' }, '★')}
        {iconBtn(surface, {}, '★', 'Search')}
      </div>
      <div className="demo-row">
        {iconBtn(surface, { shape: 'circle' }, '★')}
        {iconBtn(surface, {}, '★', 'Search')}
        {iconBtn(surface, { type: 'dashed', shape: 'circle' }, '★')}
        {iconBtn(surface, { type: 'dashed' }, '★', 'Search')}
        {iconBtn(surface, { href: 'https://ant.design', target: '_blank' }, '★')}
      </div>
    </DemoBlock>
  );
}

function IconPlacementCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="按钮图标位置 icon-placement">
      <Row label="start">
        {iconBtn(surface, { type: 'primary', shape: 'circle' }, '★')}
        {renderBtn(surface, { type: 'primary', shape: 'circle' }, 'A')}
        {iconBtn(surface, { type: 'primary', ...placementProp(surface, 'start') }, '★', 'Search')}
        {iconBtn(surface, { shape: 'circle' }, '★')}
        {iconBtn(surface, { ...placementProp(surface, 'start') }, '★', 'Search')}
      </Row>
      <Row label="end">
        {iconBtn(surface, { shape: 'circle' }, '★')}
        {iconBtn(surface, { ...placementProp(surface, 'end') }, '★', 'Search')}
        {iconBtn(surface, { type: 'text', ...placementProp(surface, 'end') }, '★', 'Search')}
        {iconBtn(surface, { type: 'dashed', shape: 'circle' }, '★')}
        {iconBtn(surface, { type: 'dashed', ...placementProp(surface, 'end') }, '★', 'Search')}
        {iconBtn(surface, { href: 'https://ant.design', target: '_blank', ...placementProp(surface, 'end') }, '★')}
        {renderBtn(surface, { type: 'primary', loading: true, ...placementProp(surface, 'end') }, 'Loading')}
      </Row>
    </DemoBlock>
  );
}

function SizeCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="按钮尺寸 size">
      {SIZES.map((size) => (
        <Row label={size} key={size}>
          {renderBtn(surface, { type: 'primary', size }, 'Primary')}
          {renderBtn(surface, { size }, 'Default')}
          {renderBtn(surface, { type: 'dashed', size }, 'Dashed')}
          {renderBtn(surface, { type: 'link', size }, 'Link')}
          {iconBtn(surface, { type: 'primary', size }, '↓')}
          {iconBtn(surface, { type: 'primary', shape: 'circle', size }, '↓')}
          {iconBtn(surface, { type: 'primary', shape: 'round', size }, '↓')}
          {iconBtn(surface, { type: 'primary', shape: 'round', size }, '↓', 'Download')}
          {iconBtn(surface, { type: 'primary', size }, '↓', 'Download')}
        </Row>
      ))}
    </DemoBlock>
  );
}

function DisabledCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="不可用状态 disabled">
      <Row label="primary">
        {renderBtn(surface, { type: 'primary' }, 'Primary')}
        {renderBtn(surface, { type: 'primary', disabled: true }, 'Primary(disabled)')}
      </Row>
      <Row label="default">
        {renderBtn(surface, {}, 'Default')}
        {renderBtn(surface, { disabled: true }, 'Default(disabled)')}
      </Row>
      <Row label="dashed">
        {renderBtn(surface, { type: 'dashed' }, 'Dashed')}
        {renderBtn(surface, { type: 'dashed', disabled: true }, 'Dashed(disabled)')}
      </Row>
      <Row label="text">
        {renderBtn(surface, { type: 'text' }, 'Text')}
        {renderBtn(surface, { type: 'text', disabled: true }, 'Text(disabled)')}
      </Row>
      <Row label="link">
        {renderBtn(surface, { type: 'link' }, 'Link')}
        {renderBtn(surface, { type: 'link', disabled: true }, 'Link(disabled)')}
      </Row>
      <Row label="href">
        {renderBtn(surface, { type: 'primary', href: 'https://ant.design', target: '_blank' }, 'Href Primary')}
        {renderBtn(surface, { type: 'primary', href: 'https://ant.design', target: '_blank', disabled: true }, 'Href Primary(disabled)')}
      </Row>
      <Row label="danger default">
        {renderBtn(surface, { danger: true }, 'Danger Default')}
        {renderBtn(surface, { danger: true, disabled: true }, 'Danger Default(disabled)')}
      </Row>
      <Row label="danger text">
        {renderBtn(surface, { type: 'text', danger: true }, 'Danger Text')}
        {renderBtn(surface, { type: 'text', danger: true, disabled: true }, 'Danger Text(disabled)')}
      </Row>
      <Row label="danger link">
        {renderBtn(surface, { type: 'link', danger: true }, 'Danger Link')}
        {renderBtn(surface, { type: 'link', danger: true, disabled: true }, 'Danger Link(disabled)')}
      </Row>
      <Row label="ghost">
        <div className="demo-ghost-bg">
          {renderBtn(surface, { ghost: true }, 'Ghost')}
          {renderBtn(surface, { ghost: true, disabled: true }, 'Ghost(disabled)')}
        </div>
      </Row>
    </DemoBlock>
  );
}

function LoadingCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="加载中状态 loading">
      <div className="demo-row">
        {renderBtn(surface, { type: 'primary', loading: true }, 'Loading')}
        {renderBtn(surface, { type: 'primary', size: 'small', loading: true }, 'Loading')}
        {iconBtn(surface, { type: 'primary', loading: true }, '⚡')}
        {loadingIconBtn(surface, 'Loading Icon')}
      </div>
      <div className="demo-row">
        {renderBtn(surface, { type: 'primary', loading: true }, 'Icon Start')}
        {renderBtn(surface, { type: 'primary', loading: true, ...placementProp(surface, 'end') }, 'Icon End')}
        {iconBtn(surface, { type: 'primary', loading: true }, '⚡', 'Icon Replace')}
        {iconBtn(surface, { type: 'primary', loading: true }, '⚡')}
        {iconBtn(surface, { type: 'primary', loading: true }, '⚡', 'Loading Icon')}
      </div>
    </DemoBlock>
  );
}

function MultipleCase({ surface }: { surface: SurfaceName }) {
  const group =
    surface === 'ooa'
      ? createElement(
          'ooa-button-group',
          null,
          OoaButton({}, 'Actions'),
          createElement('ooa-button', {}, createElement('span', { slot: 'icon' }, '⋯')),
        )
      : createElement(
          AntButton.Group,
          null,
          createElement(AntButton, null, 'Actions'),
          createElement(AntButton, { icon: createElement('span', null, '⋯') }),
        );
  return (
    <DemoBlock label="多个按钮组合 multiple">
      <div className="demo-stack">
        {renderBtn(surface, { type: 'primary' }, 'primary')}
        {renderBtn(surface, {}, 'secondary')}
        {group}
      </div>
    </DemoBlock>
  );
}

function GhostCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="幽灵按钮 ghost">
      <div className="demo-ghost-bg">
        {renderBtn(surface, { type: 'primary', ghost: true }, 'Primary')}
        {renderBtn(surface, { ghost: true }, 'Default')}
        {renderBtn(surface, { type: 'dashed', ghost: true }, 'Dashed')}
        {renderBtn(surface, { type: 'primary', danger: true, ghost: true }, 'Danger')}
      </div>
    </DemoBlock>
  );
}

function DangerCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="危险按钮 danger">
      <div className="demo-row">
        {renderBtn(surface, { type: 'primary', danger: true }, 'Primary')}
        {renderBtn(surface, { danger: true }, 'Default')}
        {renderBtn(surface, { type: 'dashed', danger: true }, 'Dashed')}
        {renderBtn(surface, { type: 'text', danger: true }, 'Text')}
        {renderBtn(surface, { type: 'link', danger: true }, 'Link')}
      </div>
    </DemoBlock>
  );
}

function BlockCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="Block 按钮 block">
      <div className="demo-block-stack">
        {renderBtn(surface, { type: 'primary', block: true }, 'Primary')}
        {renderBtn(surface, { block: true }, 'Default')}
        {renderBtn(surface, { type: 'dashed', block: true }, 'Dashed')}
        {renderBtn(surface, { block: true, disabled: true }, 'disabled')}
        {renderBtn(surface, { type: 'text', block: true }, 'text')}
        {renderBtn(surface, { type: 'link', block: true }, 'Link')}
      </div>
    </DemoBlock>
  );
}

function ChineseSpaceCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="移除两个汉字之间的空格 autoInsertSpace">
      <div className="demo-row">
        {renderBtn(surface, { type: 'primary', ...autoSpaceProp(surface, false) }, '确定')}
        {renderBtn(surface, { type: 'primary', ...autoSpaceProp(surface, true) }, '确定')}
      </div>
    </DemoBlock>
  );
}

function ChineseCharsLoadingCase({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="加载中 bug 还原 chinese chars loading">
      <div className="demo-row">
        {renderBtn(surface, {}, createElement('span', null, createElement('span', null, '部署')))}
        {renderBtn(surface, { loading: true }, '部署')}
        {renderBtn(surface, { loading: true }, '部署')}
        {renderBtn(surface, { loading: true }, createElement('span', null, '部署'))}
        {renderBtn(surface, { loading: true }, 'Submit')}
        {iconBtn(surface, { loading: true }, '⚡', '部署')}
        {renderBtn(surface, { loading: true }, '按钮')}
      </div>
    </DemoBlock>
  );
}

function renderButton(surface: SurfaceName) {
  return (
    <div className="demo-stack">
      <TypeCase surface={surface} />
      <ColorVariantCase surface={surface} />
      <IconCase surface={surface} />
      <IconPlacementCase surface={surface} />
      <SizeCase surface={surface} />
      <DisabledCase surface={surface} />
      <LoadingCase surface={surface} />
      <MultipleCase surface={surface} />
      <GhostCase surface={surface} />
      <DangerCase surface={surface} />
      <BlockCase surface={surface} />
      <ChineseSpaceCase surface={surface} />
      <ChineseCharsLoadingCase surface={surface} />
    </div>
  );
}

export const BUTTON_CASES: ParityCase[] = [
  {
    id: 'button',
    component: 'button',
    label: 'Button',
    render: renderButton,
  },
];
