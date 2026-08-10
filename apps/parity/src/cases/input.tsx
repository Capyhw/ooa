import { Input as AntInput } from 'antd';
import { createElement } from 'react';
import { DemoBlock, OoaInput, OoaTextArea } from './shared';
import type { CaseContext, ParityCase, SurfaceName } from './types';

/**
 * size / disabled 有意不在此处传入：由外层 antd ConfigProvider 与
 * ooa-config-provider 全局下发。status 是组件自身的特征而非全局配置，
 * 因此作为静态示例展示。
 */
function renderInput(surface: SurfaceName, context: CaseContext) {
  if (surface === 'ooa') {
    return (
      <div className="demo-stack input-stack">
        <DemoBlock label="Basic">
          <OoaInput
            value={context.value}
            onValueChange={context.onValueChange}
            placeholder="Type to compare"
          />
        </DemoBlock>
        <DemoBlock label="Clear and count">
          <OoaInput
            value={context.value}
            onValueChange={context.onValueChange}
            placeholder="Maximum 32 characters"
            allowClear
            showCount
            maxLength={32}
          />
        </DemoBlock>
        <DemoBlock label="Password">
          {createElement('ooa-password', {
            value: context.value,
            placeholder: 'Password input',
            'allow-clear': true,
          })}
        </DemoBlock>
        <DemoBlock label="Status">
          <div className="demo-row">
            <OoaInput
              value={context.value}
              onValueChange={context.onValueChange}
              status="error"
              placeholder="Error status"
            />
            <OoaInput
              value={context.value}
              onValueChange={context.onValueChange}
              status="warning"
              placeholder="Warning status"
            />
          </div>
        </DemoBlock>
        <DemoBlock label="Textarea">
          <OoaTextArea context={context} />
        </DemoBlock>
      </div>
    );
  }

  return (
    <div className="demo-stack input-stack">
      <DemoBlock label="Basic">
        <AntInput
          value={context.value}
          onChange={(event) => context.onValueChange(event.target.value)}
          placeholder="Type to compare"
        />
      </DemoBlock>
      <DemoBlock label="Clear and count">
        <AntInput
          value={context.value}
          onChange={(event) => context.onValueChange(event.target.value)}
          placeholder="Maximum 32 characters"
          allowClear
          showCount
          maxLength={32}
        />
      </DemoBlock>
      <DemoBlock label="Password">
        <AntInput.Password
          value={context.value}
          onChange={(event) => context.onValueChange(event.target.value)}
          placeholder="Password input"
          allowClear
        />
      </DemoBlock>
      <DemoBlock label="Status">
        <div className="demo-row">
          <AntInput
            value={context.value}
            onChange={(event) => context.onValueChange(event.target.value)}
            status="error"
            placeholder="Error status"
          />
          <AntInput
            value={context.value}
            onChange={(event) => context.onValueChange(event.target.value)}
            status="warning"
            placeholder="Warning status"
          />
        </div>
      </DemoBlock>
      <DemoBlock label="Textarea">
        <AntInput.TextArea
          value={context.value}
          onChange={(event) => context.onValueChange(event.target.value)}
          rows={4}
          maxLength={120}
          showCount
          placeholder="Write a short note"
        />
      </DemoBlock>
    </div>
  );
}

export const INPUT_CASES: ParityCase[] = [
  {
    id: 'input',
    component: 'input',
    label: 'Input',
    render: renderInput,
  },
];
