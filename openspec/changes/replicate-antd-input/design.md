## Context

antd Input 家族（`components/input/`）在 v6 是 rc-input 的薄包装：`Input.tsx` / `TextArea.tsx` 包 `@rc-component/input`，`Password.tsx` / `Search.tsx` / `OTP/` 在 Input 之上叠加行为。OOA 侧不引入 rc 依赖，直接以 Lit Web Components 复刻。现状（动机见 proposal.md — Why）：

- `packages/components/src/components/input/` 已建骨架且大部分已实现（未提交）：`ooa-input` / `ooa-textarea` / `ooa-password` / `ooa-search` / `ooa-otp`、`input-helpers.ts`、`input-icons.ts`、`style/{index,token,variant,affix,textarea}.ts`、4 个测试文件。
- parity case（`apps/parity/src/cases/input.tsx`）与 storybook（`apps/storybook/stories/input.stories.ts`）已有草稿。
- 约束来自 `docs/component-replication.md`：只参考本地 antd 源码（`/Users/weiyuhang/code/myCode/ant-design`，版本 `6.5.0`）；类名 / DOM / token 对位；不做视觉分析，只审查 DOM 与计算样式。

## Goals / Non-Goals

**Goals:**
- Input 家族五个组件与 antd 在相同输入下 DOM 结构、类名、行为 1:1 对齐，可被 parity 应用断言。
- 样式全部经全局 `--ooa-*` token 表达（组件 token `--ooa-input-*` 带 fallback），主题 / 尺寸 / 方向 / 禁用经 `ooa-config-provider` 全局下发。
- 纯逻辑（变体 / 尺寸归一化、计数、clear 可见性、纯 textarea 判定）抽到 `input-helpers.ts` 先行单测。

**Non-Goals:**
- antd `count={{ show, max, strategy, exceedFormatter }}` 对象形式（advance-count demo）、`Input.Group`、`addonBefore`/`addonAfter`、Form 上下文联动、Space.Compact —— 见 spec「未纳入本变更的行为」。
- OTP 的 `autoFocus` 之外的 ImperativeHandle API（focus/blur 整体方法）不实现。

## Decisions

### D1. 模块对位表（antd 源码 → OOA）

沿用 component-replication.md §1.1 的 button 对位规律：

| antd（components/input/…） | OOA（components/input/…） | 对位职责 |
|---|---|---|
| `Input.tsx` | `ooa-input.ts` | 主元素：属性 / 渲染 / 事件 |
| `TextArea.tsx` | `ooa-textarea.ts` | textarea 分支（autoSize / data-count） |
| `Password.tsx` | `ooa-password.ts` | 类型切换 + eye 图标（子类化 ooa-input） |
| `Search.tsx` | `ooa-search.ts` | 容器 + 按钮 + onSearch |
| `OTP/index.tsx` `OTP/OTPInput.tsx` | `ooa-otp.ts` | 单格输入 / 键盘 / 粘贴 / mask |
| `utils.ts`（`hasPrefixSuffix`） | `ooa-input.ts` 内 `hasAffix` getter | affix 分支判定 |
| `hooks/useRemovePasswordTimeout.ts` | —（OOA 不做密码延时移除，受控 value 无需） | — |
| `style/index.ts`（`genStyleHooks`） | `style/index.ts` | `inputStyles` 组合导出 |
| `style/token.ts`（`prepareComponentToken`） | `style/token.ts` | 全局 token → `--ooa-input-*` 变量 |
| `style/variants.ts` | `style/variant.ts` | 四种变体样式 |
| `style/index.ts` 内 affix / focus | `style/affix.ts` | affix-wrapper / clear / 计数 / 聚焦态 |
| `style/textarea.ts` | `style/textarea.ts` | textarea / data-count / autoSize |
| `style/search.ts` `style/otp.ts` | `ooa-search.ts` / `ooa-otp.ts` 内 `css` | search 布局 / OTP 单格样式 |

antd 的 `Group.tsx`（废弃）与 `style/search.ts`、`style/otp.ts` 不复刻为独立文件，前者不做，后者就近并入组件（小且只服务单组件）。

### D2. 渲染分支：裸 input vs affix-wrapper（对位 rc-input BaseInput）

核心形态决策与 button 的 single-root 不同：input 有两种 DOM 形态，由 `hasAffix`（= `allowClear || showCount || hasPrefixSlot || hasSuffixSlot || extraSuffix`）驱动。变体 / 状态 / out-of-range 类只落在「最外层对应元素」上（裸分支=input，affix 分支=wrapper），内部 input 只保留 base + 尺寸 + disabled + 方向类。选这个模型是因为它直接映射 rc-input BaseInput 的真实 DOM，parity 断言的 class 集合才与 antd 一致。备选（一律包 wrapper）会使裸分支 DOM 与 antd 不一致，否决。

### D3. Password 用子类化而非组合

`ooa-password extends OoaInput`，通过受保护扩展点覆盖：`effectiveType`（visible ? text : password）、`extraRootClass()`（`ooa-input-password`）、`hasExtraSuffix()` / `extraSuffix()`（eye 图标插入 suffix）。备选组合（password 内部包一个 ooa-input）会多一层自定义元素宿主，DOM 结构与 antd（单 input）不一致，否决。类型切换只改 type 不触发 change（对位 antd `onVisibleChange`），图标用 role=button + aria 态实现键盘可达。

### D4. Search 用组合 + 边框近似合并

`ooa-search` 是容器组件：内部渲染 `ooa-input`（`type=search`）+ 按钮，change 透传、Enter/按钮派发 `ooa-search`。antd 用 Space.Compact 合并 input 与按钮边框；OOA 暂无 Compact，用按钮 `margin-inline-start:-1px` 覆盖右 border 近似。明确不参与 1:1 DOM 断言（design 的近似，parity 只核对行为）。备选（把按钮塞进 ooa-input 的 suffix slot）会污染 input 复用语义，否决。

### D5. OTP 独立实现键盘 / 粘贴 / mask

OTP 是纯 OOA 行为最重的组件：`patchCells`（单字符覆盖 / 多字符分发）、ArrowLeft/Right、空格 Backspace、Ctrl/Cmd+Z 阻止、聚焦选全、跳空格、mask 覆盖层、`onChange` 只在全格填满时触发。这些直接对位 antd OTP/index.tsx 的 `patchValue` / `onInternalKeyDown` / `syncSelection` / `onInputFocus` / `triggerValueCellsChange`。`separator` 用 props 字符渲染 `.ooa-otp-separator`。`formatter` 尚未实现：在 `patchCells` 入口对输入文本先过 formatter，作为本次补全项。

### D6. prefix/suffix 用 light DOM slot + MutationObserver

antd 的 prefix/suffix 是 props；Lit 下用 `<span slot="prefix">` 由宿主注入，`ooa-input` 用 MutationObserver 监听 light DOM（childList + slot 属性）维持 `_hasPrefix` / `_hasSuffix`，驱动 affix 分支与 slot 渲染。选 slot 是因为它保持 web component 组合语义且与 button 的 slot 习惯一致；代价是 parity 的 React 侧要用 `createElement` 显式写 slot 子节点（已由 `shared.tsx` 的 `OoaInput` 包装收敛）。

### D7. 事件设计

统一 `ooa-change` / `ooa-search` CustomEvent：`detail={ value, sourceEvent }`，`bubbles + composed: true`。IME 组合期间抑制 change、`compositionend` 补发（对位 rc-input compositionRef）。Search 透传时 `stopPropagation` 防二次冒泡。React 侧由 `shared.tsx` 包装把 `ooa-*` 事件桥接成 React 回调。

### D8. 样式与 token 策略

- `inputStyles = [baseControlStyles, inputTokens, inputVariantStyles, inputAffixStyles, inputTextareaStyles]` 全家族共用，textarea/search/otp 在其上叠加专属 `css`。
- `token.ts` 对位 antd `prepareComponentToken` 的 JS 计算（padding、字号、shadow），用 CSS `calc()` + `max()` 表达同一公式，值跟随全局 token 可被主题覆盖（middle `4px 11px` / small `0px 7px` / large `7px 11px` 已在 parity 实测）。
- 每个 `var(--ooa-x, <字面量>)` 带 fallback，避免 token 未定义时组件空白。

## Risks / Trade-offs

- **Search 边框近似非 1:1** → 在 parity 只断言行为（Enter/按钮/loading/disabled），边框合并不参与 DOM 断言；后续有 Space.Compact 时替换。
- **slot 注入的 prefix/suffix 与 React 心智模型有落差** → `shared.tsx` 的 `OoaInput` 包装接收 React children 并转 slot，收敛差异。
- **Password 子类化共享 `@query('input')`** → 子类不覆写渲染结构时 query 仍命中，已用受保护扩展点隔离；新增扩展需同步覆写 `build*Classes`。
- **OTP `onChange` 只在全格填满触发** → 与输入中间态的 `onInput` 区分，parity 受控 demo 需同时监听以更新展示。
- **`--ooa-input-*` 计算依赖全局 token 存在** → 全部带 fallback 字面量；theme.css 由 sync 脚本生成，改 token 需重跑脚本不手改。
- **受控 value 不 reflect** → 与 antd 一致（只写 property），但 Storybook controls 需用 `.value=` 绑定而非 attribute（已有先例）。

## Migration Plan

工作区已含大部分实现（未提交）。按 docs/component-replication.md §6 以职责单一方式提交：先 helpers + 单测，再 style，再主元素，再 parity / storybook，最后 `pnpm build` 全绿验收。回滚：功能未发布，直接 reset 未提交改动即可。

## Open Questions

- OTP `formatter` 与 separator 函数形式（`(i) => ReactNode`）在受控流程中的精确触发点：实现时对照 antd 源码补齐，不影响 spec / 任务拆解。
