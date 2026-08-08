import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';

const meta = {
  title: 'Components/Button',
  component: 'ooa-button',
  // variant/color 默认不设，走 type 语法糖；设置了则双轴优先（对位 antd ButtonTypeMap）
  args: {
    type: 'default',
    variant: undefined as string | undefined,
    color: undefined as string | undefined,
    shape: 'default',
    size: undefined as string | undefined,
    danger: false,
    ghost: false,
    block: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    type: { control: 'select', options: ['default', 'primary', 'dashed', 'link', 'text'] },
    variant: { control: 'select', options: ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'] },
    color: {
      control: 'select',
      options: ['default', 'primary', 'danger', 'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold'],
    },
    shape: { control: 'select', options: ['default', 'circle', 'round', 'square'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  render: (args) => html`
    <ooa-button
      type=${args.type}
      variant=${args.variant ?? nothing}
      color=${args.color ?? nothing}
      shape=${args.shape}
      size=${args.size ?? nothing}
      ?danger=${args.danger}
      ?ghost=${args.ghost}
      ?block=${args.block}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
    >Button</ooa-button>`,
} satisfies Meta;

export default meta;
type Story = StoryObj<Meta>;

export const Default: Story = {};
export const Primary: Story = { args: { type: 'primary' } };
export const Danger: Story = { args: { danger: true } };

/** v6 双轴：color × variant 正交组合。 */
export const DualAxis: Story = { args: { color: 'red', variant: 'filled' } };
export const DangerText: Story = { args: { variant: 'text', color: 'danger' } };
export const Ghost: Story = { args: { color: 'primary', variant: 'solid', ghost: true } };
export const IconOnly: Story = {
  render: () => html`<ooa-button type="primary"><span slot="icon">★</span></ooa-button>`,
};

/**
 * Size can come from the global config instead of the element attribute.
 * ooa-config-provider passes componentSize down through Lit context; the
 * button picks it up when no `size` attribute is set.
 */
export const ConfigProviderSize: Story = {
  render: () => html`
    <ooa-config-provider component-size="small">
      <ooa-button type="primary">Small</ooa-button>
      <ooa-button>Small</ooa-button>
    </ooa-config-provider>
    <ooa-config-provider component-size="large">
      <ooa-button type="primary">Large</ooa-button>
      <ooa-button>Large</ooa-button>
    </ooa-config-provider>
  `,
};
