## Purpose

OOA 的 Input 组件族（`ooa-input` / `ooa-textarea` / `ooa-password` / `ooa-search` / `ooa-otp`）以 1:1 视觉与行为对齐复刻 antd v6（锁定 `6.5.0`）对应组件：相同输入下渲染相同 DOM 结构、类名与交互行为，供 parity 应用并排核对。

## ADDED Requirements

### Requirement: Input 根结构与类名对齐 antd

`ooa-input` 在相同属性下必须渲染与 antd Input（rc-input + antd 包装）一致的 DOM 结构与类名。无 prefix/suffix/allowClear/showCount 时走裸分支直接渲染 `<input>`；任一存在时走 affix 分支渲染 `<span class="ooa-input-affix-wrapper">` 包裹 prefix、input、suffix。

- 类名前缀统一为 `ooa-input`（对位 antd `ant-input`）；尺寸类 `ooa-input-lg` / `ooa-input-sm`；禁用 `ooa-input-disabled`；方向 `ooa-input-rtl`；变体 `ooa-input-{outlined|borderless|filled|underlined}`；状态 `ooa-input-status-{error|warning}`；超限 `ooa-input-out-of-range`。
- affix-wrapper 额外类：`ooa-input-affix-wrapper-disabled` / `-focused` / `-readonly` / `-lg` / `-sm` / `-rtl` / `-input-with-clear-btn`。
- 变体与状态类在裸分支落在 input 上，在 affix 分支只落在 wrapper 上（对位 antd BaseInput）。
- 根元素输出 `part`：input / affix-wrapper / clear，供外部样式定位。

#### Scenario: 裸输入分支
- **WHEN** `ooa-input` 没有 prefix、suffix、allowClear、showCount 且无额外 suffix
- **THEN** 渲染单个 `<input>` 元素，类名含 `ooa-input` 及解析后的尺寸 / 变体 / 状态 / 方向类，不含 affix-wrapper

#### Scenario: affix 分支
- **WHEN** `allowClear` 或 `showCount` 为 true，或存在 prefix/suffix slot
- **THEN** 渲染 `<span class="ooa-input-affix-wrapper">`，内部按 prefix span → input → suffix span 顺序，input 上不再带变体 / 状态类

#### Scenario: 聚焦态类
- **WHEN** 内部 input 获得焦点
- **THEN** affix-wrapper 获得 `ooa-input-affix-wrapper-focused` 类，失焦后移除

### Requirement: 变体 / 尺寸 / 状态 / 禁用解析

`ooa-input` 必须把组件属性与全局配置合并为单一派生值，规则对齐 antd `useVariant` / `useSize` / `getMergedStatus` / DisabledContext。

- 变体缺省 `outlined`；`variant` 显式传入优先；`bordered=false` 归一化为 `borderless`（`bordered` 为废弃旧 API）。
- 尺寸取值 `small` / `middle` / `large`，`medium` 归一化为 `middle`；组件 `size` 未设时取全局 `component-size`。
- 状态 `error` / `warning` 缺省无；组件 `status` 未设时无（Form 上下文暂不实现）。
- 禁用为组件 `disabled` 与全局 `disabled` 的或。

#### Scenario: bordered 废弃归一化
- **WHEN** `ooa-input` 设置 `bordered=false` 且未设 `variant`
- **THEN** 类名为 `ooa-input-borderless`

#### Scenario: 全局尺寸下发
- **WHEN** 组件未设 `size` 而全局配置 `component-size=small`
- **THEN** 类名含 `ooa-input-sm`

#### Scenario: medium 别名
- **WHEN** `size=medium`
- **THEN** 按 middle 处理（类名不含 `-lg` / `-sm`）

### Requirement: value 与 change 事件

`ooa-input` 以 DOM property 承载受控值（不 reflect 到 attribute）。输入变化必须派发 `ooa-change` CustomEvent，`detail` 为 `{ value, sourceEvent }`，`bubbles` 与 `composed` 为 true。IME 组合期间不得触发 change，组合结束补发一次完整值 change。

- 属性 `value`、`placeholder`、`type`、`name`、`max-length`、`autocomplete`、`auto-focus`、`readonly` 对齐 antd 对应 props。

#### Scenario: 输入触发 change
- **WHEN** 用户在 input 中输入字符
- **THEN** 派发一次 `ooa-change`，`detail.value` 为输入后完整值，事件冒泡且穿透 shadow DOM

#### Scenario: IME 组合抑制
- **WHEN** 用户用输入法组合输入且 `compositionstart` 已触发、`compositionend` 未触发
- **THEN** 组合期间的 `input` 事件不派发 `ooa-change`；`compositionend` 时派发一次携带完整值

### Requirement: allowClear 清除图标

`allowClear` 为 true 时渲染清除按钮（`ooa-input-clear-icon`）。图标仅在非禁用、非只读且有值时可见（`ooa-input-clear-icon-hidden` 隐藏）。点击清除行为对齐 antd `handleReset`：清空 value、派发 `ooa-change`、回焦 input。

- 清除按钮在 suffix 之前，存在 suffix/showCount 时带 `ooa-input-clear-icon-has-suffix` 类；mousedown 需 `preventDefault` 防止点击时失焦。

#### Scenario: 可见性
- **WHEN** `allowClear=true`、value 为空或组件 disabled/readonly
- **THEN** 清除图标带 `ooa-input-clear-icon-hidden` 类（不触发清除）

#### Scenario: 点击清除
- **WHEN** 用户点击可见的清除图标
- **THEN** value 清空、派发 `ooa-change` 携带空串、内部 input 重新获得焦点

### Requirement: showCount 计数与超限

`showCount` 为 true 时在 suffix 位置渲染计数文本（对位 antd `ooa-input-show-count-suffix`，区别于 textarea 的 `data-count`）。有 `max-length` 时显示 `当前数 / 最大值`，否则仅当前数。值长度超过 `max-length` 时渲染 `ooa-input-out-of-range` 类（裸分支在 input、affix 分支在 wrapper）。

#### Scenario: 计数文本
- **WHEN** `showCount=true`、`maxLength=10`、value 为 3 字符
- **THEN** suffix 内渲染 `3 / 10`

#### Scenario: 超限态
- **WHEN** `showCount=true`、`maxLength=10`、value 为 11 字符
- **THEN** 渲染 `ooa-input-out-of-range` 类（affix 分支落在 wrapper 上）

### Requirement: prefix 与 suffix

prefix 与 suffix 由宿主 light DOM 中带 `slot="prefix"` / `slot="suffix"` 的元素提供。任一存在即进入 affix 分支，分别渲染 `ooa-input-prefix` / `ooa-input-suffix` span 包裹对应 slot。suffix span 仅在 suffix 内容、allowClear、showCount 或额外 suffix 任一存在时渲染。

#### Scenario: prefix slot
- **WHEN** 宿主 light DOM 含 `<span slot="prefix">` 元素
- **THEN** 进入 affix 分支，渲染 `ooa-input-prefix` span 并插槽输出该元素

### Requirement: TextArea

`ooa-textarea` 对位 antd Input.TextArea，渲染 `<textarea>` 元素，属性 `rows`（缺省 4）、`max-length`、`show-count`、`allow-clear`、`auto-size`、`disabled`、`readonly`、`status`、`size`、`variant` 对齐 antd。

- 无 showCount/allowClear 时走裸分支直接渲染 textarea；任一存在时走 affix 分支（`ooa-input-textarea-affix-wrapper`）。
- showCount 计数渲染为 textarea 专属的 `ooa-input-data-count` span，且 affix wrapper 带 `data-count` 属性与 `ooa-input-textarea-show-count` 类。
- `auto-size` 为 true 时：先清高再按 scrollHeight 撑开，content 变化时自动调整高度。
- 尺寸类 / 变体类 / 状态类 / out-of-range 类规则与 Input 一致（裸分支落在 textarea、affix 分支落在 wrapper）。

#### Scenario: 纯 textarea 分支
- **WHEN** `ooa-textarea` 未设 `auto-size`、`show-count`、`allow-clear`
- **THEN** 渲染单个 `<textarea>` 元素，类名含 `ooa-input` 及尺寸 / 变体类，无 affix wrapper

#### Scenario: autoSize 自适应高度
- **WHEN** `auto-size=true` 且 textarea 内容增长
- **THEN** textarea 高度随 scrollHeight 增大而增高，内容减少后回落

#### Scenario: textarea 计数
- **WHEN** `show-count=true` 且 value 为 3 字符
- **THEN** affix wrapper 带 `ooa-input-textarea-show-count` 类与 `data-count="3"`，内部渲染 `ooa-input-data-count` span

### Requirement: Password

`ooa-password` 对位 antd Input.Password，复用 `ooa-input` 渲染，根元素追加 `ooa-input-password` 类。初始 `type=password`，点击可见性图标后切换 `type=text`，切换只改 type 不触发 change。可见性图标为 `ooa-input-password-icon` span，支持键盘（Enter / Space）触发，禁用态不可交互。

- `visibility-toggle` 缺省 true；为 false 时不渲染图标。
- 图标带 aria 语义：`role=button`、`aria-pressed`、`aria-label`、`aria-disabled`，tabindex 在禁用时为 -1。

#### Scenario: 类型切换
- **WHEN** 用户点击可见性图标（当前 type=password）
- **THEN** 内部 input 的 type 变为 text，图标切换为隐藏形态，且不派发 `ooa-change`

#### Scenario: visibilityToggle 关闭
- **WHEN** `visibility-toggle=false`
- **THEN** 不渲染 `ooa-input-password-icon`，input type 恒为 password

### Requirement: Search

`ooa-search` 对位 antd Input.Search，渲染 `.ooa-search` 容器，内部为 `ooa-input`（`type=search`）与搜索按钮。按 Enter 或点击按钮派发 `ooa-search` CustomEvent（`detail={ value, sourceEvent }`）。内部 input 的 change 透传为 `ooa-change`（不二次冒泡）。

- `enter-button` 为 true 时按钮显示 slot `enter-button` 内容（缺省文本 Search），否则显示搜索图标。
- `loading` 为 true 时按钮禁用；`disabled` 时按钮与 input 均禁用。
- 边框合并用按钮覆盖 input 右 border 近似 antd Space.Compact（不参与 1:1 DOM 断言）。

#### Scenario: 回车搜索
- **WHEN** 用户在内部 input 中按 Enter
- **THEN** 派发 `ooa-search`，`detail.value` 为当前值

#### Scenario: loading 禁用
- **WHEN** `loading=true`
- **THEN** 搜索按钮禁用，点击不派发 `ooa-search`

### Requirement: OTP

`ooa-otp` 对位 antd Input.OTP，渲染 `role="group"` 的 `.ooa-otp` 容器，内含 `length`（缺省 6）个 `.ooa-otp-input-wrapper`，每个包裹一个单格 input（类名 `ooa-otp-input ooa-input ...`）。受控值以完整字符串 `value` 承载。

- 输入单个字符覆盖当前格并跳到下一格；粘贴多字符从当前格起分发（`patchCells` 语义）。
- 键盘导航对齐 antd：ArrowLeft / ArrowRight 移格；当前格为空时 Backspace 跳前一格；Ctrl/Cmd+Z 阻止默认；聚焦选中整格内容；聚焦时若有前空格则跳到第一个空格。
- `mask=true` 时 input type=password 且聚焦态透明显示实际字符；`mask="x"` 字符串时渲染 `.ooa-otp-mask-icon` 覆盖层显示该字符。
- `separator` 在相邻格之间渲染 `.ooa-otp-separator`。
- `auto-focus` 聚焦第 0 格。
- 尺寸 / 变体 / 状态 / 禁用 / RTL 类对齐 antd（`ooa-otp-lg` / `ooa-otp-sm` / `ooa-otp-rtl`，每格 `ooa-input-{variant}` / `ooa-input-status-{status}` / `ooa-input-disabled`）。

#### Scenario: 单字符输入前进
- **WHEN** 用户在第 0 格输入字符 "A"
- **THEN** 第 0 格值为 "A"，焦点移到第 1 格，`value` 更新为 "A"

#### Scenario: 全格填满触发 change
- **WHEN** 所有 `length` 格均已填且本次输入使值变化
- **THEN** 派发 `ooa-change`，`detail.value` 为全部格子拼接的完整字符串

#### Scenario: mask 覆盖层
- **WHEN** `mask="🔒"` 且某格有字符
- **THEN** 该格渲染 `ooa-otp-mask-icon` span 显示 "🔒"，input 的 value 为该格实际字符

#### Scenario: formatter 格式化
- **WHEN** 提供 `formatter`（如转大写）且 value 变化
- **THEN** 各格显示 formatter 处理后的字符，完整值也经 formatter 归一

### Requirement: 方向 / 主题全局对齐

组件族在 `direction=rtl` 的全局配置下渲染 `-rtl` 类（input / affix-wrapper / textarea / otp），布局镜像。全局 `disabled` 配置与组件 `disabled` 合并。主题暗色由 `ooa-config-provider[theme=dark]` 下的 CSS 变量自动生效，组件不写死视觉值。

#### Scenario: RTL 类
- **WHEN** 全局配置 `direction=rtl`
- **THEN** 裸 input 带 `ooa-input-rtl` 类，affix wrapper 带 `ooa-input-affix-wrapper-rtl` 类

### Requirement: parity 应用对照官网示例页

`apps/parity/src/cases/input.tsx` 必须以 antd 官网示例页（本地 `components/input/index.zh-CN.md` 的 `代码演示` 一节）为蓝本：一个官网 demo 对应一个 DemoBlock，标题沿用官网中文名，OOA 侧与本地 antd 侧（`apps/parity` 的 `antd` 依赖版本）并排渲染同一组 demo，供肉眼 / 浏览器审查 1:1 核对。全局正交轴（theme / direction / size / disabled）由外层 ConfigProvider 与 ooa-config-provider 下发，case 只传组件级语义。

- 必须覆盖的 demo（OOA 侧与 antd 侧对称）：基本使用、三种大小、形态变体、搜索框、搜索框 loading、文本域、适应文本高度的文本域、一次性密码框、密码框、带移除图标、带字数提示、自定义状态、前缀和后缀（后缀内 Tooltip 省略为纯图标）、聚焦（交互按钮简化为静态展示）。
- 省略或占位：`advance-count`（count 对象 API，见非目标）、`compact-style` 与 `search-input` 中的 Space.Compact / Space.Addon 部分、`tooltip`（依赖 Tooltip / antd-style）、`style-class`（依赖 antd-style 语义 classNames API）——按复刻规范 §3.4 / §3.5 处理。

#### Scenario: 官网 demo 全覆盖
- **WHEN** 打开 parity 的 input case
- **THEN** 每个纳入范围的官网 demo 都以同名 DemoBlock 在 OOA 与 antd 两侧对称出现，未实现的 demo 不在页面中留空位

## 未纳入本变更的行为（记录为非目标）

- antd `count={{ show, max, strategy, exceedFormatter }}` 对象形式与 `advance-count` 官网 demo：超出当前 boolean `showCount` + `max-length` 能力，本次不实现、不建对应 parity case（对位复刻规范 §3.4 省略依赖未支持 API 的 demo）。
- antd `Input.Group`、`addonBefore` / `addonAfter`（已废弃，改用 `Space.Compact`；OOA 无 Space.Compact）：不实现、不建 parity case。
- Form 上下文联动（`Form.Item` 的 status / hasFeedback）与 Tooltip 相关交互：暂不实现。
