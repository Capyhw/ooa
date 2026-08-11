import { useState, type ReactNode } from 'react';
import { Input as AntInput } from 'antd';
import { DemoBlock, OoaInput, OoaOtp, OoaPassword, OoaSearch, OoaTextArea } from './shared';
import type { CaseContext, ParityCase, SurfaceName } from './types';

/**
 * 对比示例对齐 antd 官网 input 文档（https://ant.design/components/input-cn）的 demo 结构：
 * 每个官网 demo 一个 DemoBlock，标题沿用官网中文名；属性与顺序照搬官网。
 *
 * 官网 demo 里依赖 OOA 没有的辅助组件的部分一律省略（对位 docs/component-replication.md §3.4）：
 * - search-input 的 Space.Compact / Space.Addon 与 suffix 变体省略
 * - autosize-textarea 的 minRows/maxRows 对象形式（OOA auto-size 仅布尔）省略
 * - password-input 的 iconRender 与受控 visibilityToggle + Button 交互改为静态展示
 * - show-count 的 resize:none 样式变体省略
 * - presuffix 的 Tooltip 省略为纯图标、Password 带 suffix 一行省略
 * - focus 的按钮/开关交互简化为静态展示
 * - advance-count / compact-style / tooltip / style-class / group / addon（debug）不建
 *
 * size / disabled / theme / direction 由外层 antd ConfigProvider 与 ooa-config-provider
 * 全局下发，case 里只传组件级语义（variant / status / size 演示 / allowClear / showCount …）。
 * 受控 value 经 CaseContext 在 OOA 与 antd 两侧共享；OTP 语义特殊（短码），用块内局部状态。
 */

/** OOA 侧受控 props：value + onValueChange（事件经 shared.tsx 桥接）。 */
function ooaBound(context: CaseContext) {
  return { value: context.value, onValueChange: context.onValueChange };
}

/** antd 侧受控 props：value + onChange。 */
function antdBound(context: CaseContext) {
  return {
    value: context.value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      context.onValueChange(e.target.value),
  };
}

function BasicCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="基本使用">
      {surface === 'ooa' ? (
        <OoaInput {...ooaBound(context)} placeholder="Basic usage" />
      ) : (
        <AntInput {...antdBound(context)} placeholder="Basic usage" />
      )}
    </DemoBlock>
  );
}

function SizeCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="三种大小">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} size="large" prefix="👤" placeholder="large size" />
            <OoaInput {...ooaBound(context)} prefix="👤" placeholder="default size" />
            <OoaInput {...ooaBound(context)} size="small" prefix="👤" placeholder="small size" />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} size="large" prefix="👤" placeholder="large size" />
            <AntInput {...antdBound(context)} prefix="👤" placeholder="default size" />
            <AntInput {...antdBound(context)} size="small" prefix="👤" placeholder="small size" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function VariantCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="形态变体">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} placeholder="Outlined" />
            <OoaInput {...ooaBound(context)} variant="filled" placeholder="Filled" />
            <OoaInput {...ooaBound(context)} variant="borderless" placeholder="Borderless" />
            <OoaInput {...ooaBound(context)} variant="underlined" placeholder="Underlined" />
            <OoaSearch {...ooaBound(context)} variant="filled" placeholder="Filled" />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} placeholder="Outlined" />
            <AntInput {...antdBound(context)} variant="filled" placeholder="Filled" />
            <AntInput {...antdBound(context)} variant="borderless" placeholder="Borderless" />
            <AntInput {...antdBound(context)} variant="underlined" placeholder="Underlined" />
            <AntInput.Search {...antdBound(context)} variant="filled" placeholder="Filled" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function SearchCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="搜索框">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaSearch {...ooaBound(context)} placeholder="input search text" />
            <OoaSearch {...ooaBound(context)} allowClear placeholder="input search text" />
            <OoaSearch {...ooaBound(context)} enterButton placeholder="input search text" />
            <OoaSearch
              {...ooaBound(context)}
              allowClear
              enterButton="Search"
              size="large"
              placeholder="input search text"
            />
          </>
        ) : (
          <>
            <AntInput.Search {...antdBound(context)} placeholder="input search text" />
            <AntInput.Search {...antdBound(context)} allowClear placeholder="input search text" />
            <AntInput.Search {...antdBound(context)} enterButton placeholder="input search text" />
            <AntInput.Search
              {...antdBound(context)}
              allowClear
              enterButton="Search"
              size="large"
              placeholder="input search text"
            />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function SearchLoadingCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="搜索框 loading">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaSearch {...ooaBound(context)} loading placeholder="input search loading default" />
            <OoaSearch
              {...ooaBound(context)}
              loading
              enterButton
              placeholder="input search loading with enterButton"
            />
            <OoaSearch
              {...ooaBound(context)}
              loading
              enterButton="Search"
              size="large"
              placeholder="input search text"
            />
          </>
        ) : (
          <>
            <AntInput.Search {...antdBound(context)} loading placeholder="input search loading default" />
            <AntInput.Search
              {...antdBound(context)}
              loading
              enterButton
              placeholder="input search loading with enterButton"
            />
            <AntInput.Search
              {...antdBound(context)}
              loading
              enterButton="Search"
              size="large"
              placeholder="input search text"
            />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function TextareaCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="文本域">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaTextArea context={context} rows={4} />
            <OoaTextArea context={context} rows={4} placeholder="maxLength is 6" maxLength={6} />
          </>
        ) : (
          <>
            <AntInput.TextArea {...antdBound(context)} rows={4} />
            <AntInput.TextArea {...antdBound(context)} rows={4} placeholder="maxLength is 6" maxLength={6} />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function AutosizeCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="适应文本高度的文本域">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaTextArea context={context} autoSize placeholder="Autosize height based on content lines" />
            <OoaTextArea context={context} autoSize placeholder="Controlled autosize" />
          </>
        ) : (
          <>
            <AntInput.TextArea {...antdBound(context)} autoSize placeholder="Autosize height based on content lines" />
            <AntInput.TextArea {...antdBound(context)} autoSize placeholder="Controlled autosize" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function OtpCase({ surface }: { surface: SurfaceName }) {
  // OTP 是短码输入，语义独立于主 value：块内局部状态在 OOA 与 antd 两侧共享。
  const [otpValue, setOtpValue] = useState('');
  return (
    <DemoBlock label="一次性密码框">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaOtp value={otpValue} onValueChange={setOtpValue} formatter={(text) => text.toUpperCase()} />
            <OoaOtp value={otpValue} onValueChange={setOtpValue} disabled />
            <OoaOtp value={otpValue} onValueChange={setOtpValue} length={8} />
            <OoaOtp value={otpValue} onValueChange={setOtpValue} variant="filled" />
            <OoaOtp value={otpValue} onValueChange={setOtpValue} mask="🔒" />
            <OoaOtp value={otpValue} onValueChange={setOtpValue} separator="/" />
          </>
        ) : (
          <>
            {/* antd OTP：onChange 仅全格填满触发，onInput 上报中间态，两侧才能实时同步 */}
            <AntInput.OTP
              value={otpValue}
              onChange={setOtpValue}
              onInput={(arr) => setOtpValue(arr.join(''))}
              formatter={(text) => text.toUpperCase()}
            />
            <AntInput.OTP value={otpValue} onChange={setOtpValue} onInput={(arr) => setOtpValue(arr.join(''))} disabled />
            <AntInput.OTP value={otpValue} onChange={setOtpValue} onInput={(arr) => setOtpValue(arr.join(''))} length={8} />
            <AntInput.OTP value={otpValue} onChange={setOtpValue} onInput={(arr) => setOtpValue(arr.join(''))} variant="filled" />
            <AntInput.OTP value={otpValue} onChange={setOtpValue} onInput={(arr) => setOtpValue(arr.join(''))} mask="🔒" />
            <AntInput.OTP value={otpValue} onChange={setOtpValue} onInput={(arr) => setOtpValue(arr.join(''))} separator={<span>/</span>} />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function PasswordCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="密码框">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaPassword {...ooaBound(context)} placeholder="input password" />
            <OoaPassword {...ooaBound(context)} placeholder="disabled input password" disabled />
          </>
        ) : (
          <>
            <AntInput.Password {...antdBound(context)} placeholder="input password" />
            <AntInput.Password {...antdBound(context)} placeholder="disabled input password" disabled />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function AllowClearCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="带移除图标">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} allowClear placeholder="input with clear icon" />
            <OoaTextArea context={context} allowClear placeholder="textarea with clear icon" />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} allowClear placeholder="input with clear icon" />
            <AntInput.TextArea {...antdBound(context)} allowClear placeholder="textarea with clear icon" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function ShowCountCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="带字数提示">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} showCount maxLength={20} />
            <OoaTextArea context={context} showCount maxLength={100} placeholder="can resize" />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} showCount maxLength={20} />
            <AntInput.TextArea {...antdBound(context)} showCount maxLength={100} placeholder="can resize" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function StatusCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="自定义状态">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} status="error" placeholder="Error" />
            <OoaInput {...ooaBound(context)} status="warning" placeholder="Warning" />
            <OoaInput {...ooaBound(context)} status="error" prefix="🕐" placeholder="Error with prefix" />
            <OoaInput {...ooaBound(context)} status="warning" prefix="🕐" placeholder="Warning with prefix" />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} status="error" placeholder="Error" />
            <AntInput {...antdBound(context)} status="warning" placeholder="Warning" />
            <AntInput {...antdBound(context)} status="error" prefix="🕐" placeholder="Error with prefix" />
            <AntInput {...antdBound(context)} status="warning" prefix="🕐" placeholder="Warning with prefix" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function PreSuffixCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="前缀和后缀">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} prefix="👤" suffix="ℹ" placeholder="Enter your username" />
            <OoaInput {...ooaBound(context)} prefix="￥" suffix="RMB" />
            <OoaInput {...ooaBound(context)} prefix="￥" suffix="RMB" disabled />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} prefix="👤" suffix="ℹ" placeholder="Enter your username" />
            <AntInput {...antdBound(context)} prefix="￥" suffix="RMB" />
            <AntInput {...antdBound(context)} prefix="￥" suffix="RMB" disabled />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function FocusCase({ surface, context }: { surface: SurfaceName; context: CaseContext }) {
  return (
    <DemoBlock label="聚焦">
      <div className="demo-stack">
        {surface === 'ooa' ? (
          <>
            <OoaInput {...ooaBound(context)} placeholder="Focus demo" />
            <OoaTextArea context={context} placeholder="Focus demo" />
          </>
        ) : (
          <>
            <AntInput {...antdBound(context)} placeholder="Focus demo" />
            <AntInput.TextArea {...antdBound(context)} placeholder="Focus demo" />
          </>
        )}
      </div>
    </DemoBlock>
  );
}

function renderInput(surface: SurfaceName, context: CaseContext): ReactNode {
  return (
    <div className="demo-stack input-stack">
      <BasicCase surface={surface} context={context} />
      <SizeCase surface={surface} context={context} />
      <VariantCase surface={surface} context={context} />
      <SearchCase surface={surface} context={context} />
      <SearchLoadingCase surface={surface} context={context} />
      <TextareaCase surface={surface} context={context} />
      <AutosizeCase surface={surface} context={context} />
      <OtpCase surface={surface} />
      <PasswordCase surface={surface} context={context} />
      <AllowClearCase surface={surface} context={context} />
      <ShowCountCase surface={surface} context={context} />
      <StatusCase surface={surface} context={context} />
      <PreSuffixCase surface={surface} context={context} />
      <FocusCase surface={surface} context={context} />
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
