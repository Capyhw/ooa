import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';

/**
 * Input 家族（ooa-input / ooa-textarea / ooa-password / ooa-search / ooa-otp）的
 * controls 覆盖全部属性。meta 的 argTypes 汇总各子组件的专属属性，
 * 每个子组件一个 render story 复用这些 controls。
 */
const meta = {
  title: 'Components/Input',
  component: 'ooa-input',
  args: {
    value: '',
    placeholder: 'Type here',
    type: 'text',
    variant: undefined as string | undefined,
    status: undefined as string | undefined,
    size: undefined as string | undefined,
    allowClear: false,
    showCount: false,
    maxLength: undefined as number | undefined,
    disabled: false,
    readOnly: false,
    rows: 4,
    autoSize: false,
    visibilityToggle: true,
    enterButton: false,
    loading: false,
    length: 6,
    mask: undefined as string | undefined,
    separator: undefined as string | undefined,
  },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'borderless', 'filled', 'underlined'] },
    status: { control: 'select', options: ['error', 'warning'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    type: { control: 'select', options: ['text', 'password', 'number', 'email'] },
    maxLength: { control: 'number' },
    rows: { control: 'number' },
    autoSize: { control: 'boolean' },
    visibilityToggle: { control: 'boolean' },
    enterButton: { control: 'boolean' },
    loading: { control: 'boolean' },
    length: { control: 'number' },
    mask: { control: 'text' },
    separator: { control: 'text' },
  },
  render: (args) => html`
    <ooa-input
      .value=${args.value}
      placeholder=${args.placeholder}
      type=${args.type}
      variant=${args.variant ?? nothing}
      status=${args.status ?? nothing}
      size=${args.size ?? nothing}
      maxLength=${args.maxLength ?? nothing}
      ?allowClear=${args.allowClear}
      ?showCount=${args.showCount}
      ?disabled=${args.disabled}
      ?readOnly=${args.readOnly}
    ></ooa-input>`,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Clearable: Story = { args: { allowClear: true, value: 'Parity check' } };
export const ShowCount: Story = { args: { showCount: true, maxLength: 32, value: 'Parity check' } };
export const Error: Story = { args: { status: 'error' } };
export const Warning: Story = { args: { status: 'warning' } };
export const Disabled: Story = { args: { disabled: true, value: 'Disabled' } };
export const ReadOnly: Story = { args: { readOnly: true, value: 'Read only' } };
export const Filled: Story = { args: { variant: 'filled', value: 'Filled' } };
export const Borderless: Story = { args: { variant: 'borderless', value: 'Borderless' } };
export const Underlined: Story = { args: { variant: 'underlined', value: 'Underlined' } };

/** 带 prefix / suffix 的内容（slot 形式，对位 antd prefix/suffix props）。 */
export const Affix: Story = {
  render: () => html`
    <ooa-input placeholder="https://example.com">
      <span slot="prefix">🔗</span>
    </ooa-input>
    <ooa-input placeholder="Enter amount">
      <span slot="suffix">¥</span>
    </ooa-input>`,
};

/** 密码框（对位 antd Input.Password）。 */
export const Password: Story = {
  render: (args) => html`
    <ooa-password
      .value=${args.value}
      placeholder=${args.placeholder}
      ?allowClear=${args.allowClear}
      ?visibilityToggle=${args.visibilityToggle}
      ?disabled=${args.disabled}
      status=${args.status ?? nothing}
      size=${args.size ?? nothing}
      variant=${args.variant ?? nothing}
    ></ooa-password>`,
};

/** 文本域（对位 antd Input.TextArea）。 */
export const TextArea: Story = {
  render: (args) => html`
    <ooa-textarea
      .value=${args.value}
      placeholder=${args.placeholder}
      rows=${args.rows}
      maxLength=${args.maxLength ?? nothing}
      ?showCount=${args.showCount}
      ?allowClear=${args.allowClear}
      ?autoSize=${args.autoSize}
      ?disabled=${args.disabled}
      ?readOnly=${args.readOnly}
      status=${args.status ?? nothing}
      size=${args.size ?? nothing}
      variant=${args.variant ?? nothing}
    ></ooa-textarea>`,
};

/** 搜索框（对位 antd Input.Search）。 */
export const Search: Story = {
  args: { placeholder: 'input search text' },
  render: (args) => html`
    <ooa-search
      placeholder=${args.placeholder}
      ?enterButton=${args.enterButton}
      ?loading=${args.loading}
      ?allowClear=${args.allowClear}
      ?disabled=${args.disabled}
      size=${args.size ?? nothing}
      variant=${args.variant ?? nothing}
      status=${args.status ?? nothing}
    ></ooa-search>`,
};

/** 一次性密码框（对位 antd Input.OTP）。 */
export const Otp: Story = {
  args: { placeholder: '', length: 6 },
  render: (args) => html`
    <ooa-otp
      length=${args.length}
      ?disabled=${args.disabled}
      mask=${args.mask ?? nothing}
      separator=${args.separator ?? nothing}
      size=${args.size ?? nothing}
      variant=${args.variant ?? nothing}
      status=${args.status ?? nothing}
    ></ooa-otp>`,
};
