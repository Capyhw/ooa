import { createElement, type ReactNode } from 'react';
import { Button as AntButton, type ButtonProps } from 'antd';
import { OoaButton, DemoBlock } from './shared';
import type { ParityCase, SurfaceName } from './types';

/**
 * size / disabled 有意不在此处传入：由外层 antd ConfigProvider 与
 * ooa-config-provider 全局下发，用于验证两侧对全局配置的响应是否一致。
 *
 * variant × color 双轴矩阵 + danger 组合 + ghost + shape + 行为 states + 分组，
 * 两侧共用同一份配置数组渲染，肉眼核对 1:1。
 */

const VARIANTS = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'] as const;
const COLORS = ['default', 'primary', 'danger', 'red', 'blue'] as const;

/** 简单文字子节点的通用渲染（矩阵用）。 */
function renderBtn(surface: SurfaceName, props: Record<string, unknown>, label: string): ReactNode {
  return surface === 'ooa'
    ? OoaButton(props, label)
    : createElement(AntButton, props as ButtonProps, label);
}

/** 带图标的按钮：ooa 走 slot，antd 走 icon prop。 */
function iconBtn(surface: SurfaceName, props: Record<string, unknown>, icon: string, text?: string): ReactNode {
  if (surface === 'ooa') {
    const children: ReactNode[] = [createElement('span', { slot: 'icon' }, icon)];
    if (text) children.push(text);
    return createElement('ooa-button', props, ...children);
  }
  return createElement(AntButton, { ...(props as ButtonProps), icon: createElement('span', null, icon) }, text);
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="demo-row">
      <span className="demo-row-label">{label}</span>
      {children}
    </div>
  );
}

function VariantMatrix({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="Variant × Color">
      {VARIANTS.map((variant) => (
        <Row key={variant} label={variant}>
          {COLORS.map((color) => renderBtn(surface, { variant, color }, `${variant}/${color}`))}
        </Row>
      ))}
    </DemoBlock>
  );
}

function DangerCombos({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="Danger combos（color=danger + variant）">
      <Row label="danger solid">{renderBtn(surface, { variant: 'solid', color: 'danger' }, 'Danger solid')}</Row>
      <Row label="danger text">{renderBtn(surface, { variant: 'text', color: 'danger' }, 'Danger text')}</Row>
      <Row label="danger link">{renderBtn(surface, { variant: 'link', color: 'danger' }, 'Danger link')}</Row>
      <Row label="danger dashed">{renderBtn(surface, { variant: 'dashed', color: 'danger' }, 'Danger dashed')}</Row>
      <Row label="danger filled">{renderBtn(surface, { variant: 'filled', color: 'danger' }, 'Danger filled')}</Row>
    </DemoBlock>
  );
}

function GhostCases({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="Ghost">
      <Row label="primary ghost">{renderBtn(surface, { color: 'primary', variant: 'solid', ghost: true }, 'Primary ghost')}</Row>
      <Row label="red solid ghost">{renderBtn(surface, { color: 'red', variant: 'solid', ghost: true }, 'Red ghost')}</Row>
      <Row label="text ghost">{renderBtn(surface, { variant: 'text', ghost: true }, 'Text ghost')}</Row>
    </DemoBlock>
  );
}

function ShapeCases({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="Shape">
      <Row label="circle">{renderBtn(surface, { shape: 'circle' }, 'C')}</Row>
      <Row label="round">{renderBtn(surface, { shape: 'round' }, 'Round')}</Row>
      <Row label="square">{renderBtn(surface, { shape: 'square' }, 'S')}</Row>
    </DemoBlock>
  );
}

function StateCases({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="States & behaviors">
      <Row label="loading">{renderBtn(surface, { loading: true }, 'Loading')}</Row>
      <Row label="loading + icon">{iconBtn(surface, { loading: true }, '★', 'Loading')}</Row>
      <Row label="icon">{iconBtn(surface, { type: 'primary' }, '★', 'Search')}</Row>
      <Row label="icon-only">{iconBtn(surface, { type: 'primary' }, '★')}</Row>
      <Row label="icon-placement end">
        {iconBtn(surface, { type: 'primary', ...(surface === 'ooa' ? { 'icon-placement': 'end' } : { iconPlacement: 'end' }) }, '→', 'Next')}
      </Row>
      <Row label="anchor (href)">
        {renderBtn(surface, { type: 'primary', href: 'https://ant.design', target: '_blank' }, 'Link button')}
      </Row>
    </DemoBlock>
  );
}

function GroupCases({ surface }: { surface: SurfaceName }) {
  return (
    <DemoBlock label="Group">
      <div className="demo-row">
        {surface === 'ooa'
          ? createElement(
              'ooa-button-group',
              null,
              OoaButton({}, '1'),
              OoaButton({ type: 'primary' }, '2'),
              OoaButton({ type: 'dashed' }, '3'),
            )
          : createElement(
              AntButton.Group,
              null,
              createElement(AntButton, null, '1'),
              createElement(AntButton, { type: 'primary' }, '2'),
              createElement(AntButton, { type: 'dashed' }, '3'),
            )}
      </div>
    </DemoBlock>
  );
}

function renderButton(surface: SurfaceName) {
  return (
    <div className="demo-stack">
      <VariantMatrix surface={surface} />
      <DangerCombos surface={surface} />
      <GhostCases surface={surface} />
      <ShapeCases surface={surface} />
      <StateCases surface={surface} />
      <GroupCases surface={surface} />
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
