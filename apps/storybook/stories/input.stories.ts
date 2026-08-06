import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta = {
  title: 'Components/Input',
  component: 'ooa-input',
  args: { placeholder: 'Type here', allowClear: false, disabled: false },
  render: (args) => html`<ooa-input placeholder=${args.placeholder} ?allowClear=${args.allowClear} ?disabled=${args.disabled}></ooa-input>`,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Clearable: Story = { args: { allowClear: true } };
