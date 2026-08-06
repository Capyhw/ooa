import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta = {
  title: 'Components/Button',
  component: 'ooa-button',
  args: { type: 'default', danger: false, disabled: false, loading: false },
  argTypes: {
    type: { control: 'select', options: ['default', 'primary', 'dashed', 'link', 'text'] },
  },
  render: (args) => html`<ooa-button type=${args.type} ?danger=${args.danger} ?disabled=${args.disabled} ?loading=${args.loading}>Button</ooa-button>`,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Primary: Story = { args: { type: 'primary' } };
export const Danger: Story = { args: { danger: true } };
