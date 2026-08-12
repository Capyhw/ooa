## Why

button 已作为首个完整样例完成 1:1 复刻（见 `docs/component-replication.md`），input 是下一个目标组件。OOA 需要一个与 antd v6（当前锁定 `6.5.0`）在相同输入下渲染相同 DOM / 样式 / 行为的 Input 组件族（Input / TextArea / Password / Search / OTP），使 parity 应用并排核对 1:1。

## What Changes

在 OOA 侧新增 antd `components/input/` 组件族的完整复刻（已建骨架，需按本变更补全并提交）：

- **主元素**：`ooa-input`、`ooa-textarea`、`ooa-password`、`ooa-search`、`ooa-otp`（对位 antd `Input.tsx` / `TextArea.tsx` / `Password.tsx` / `Search.tsx` / `OTP/`）。
- **纯逻辑**：`input-helpers.ts`（变体 / 尺寸归一化、计数、clear 可见性、纯 textarea 判定）、`input-icons.ts`（clear / 搜索 / 密码可见切换等 SVG）。
- **样式**：`style/` 下 token / variant / affix / textarea 模块，全部引用全局 `--ooa-*` token + fallback，对位 antd `style/token.ts` / `variants.ts` / `index.ts` / `textarea.ts` / `search.ts` / `otp.ts`。
- **测试**：Vitest v4 browser mode（helpers 纯逻辑单测 + 组件 DOM / 行为断言）。
- **parity**：`apps/parity/src/cases/input.tsx` 照搬官网非 debug demo 结构，`shared.tsx` 增加 OOA 包装与事件桥接，注册 `PARITY_CASES`。
- **storybook**：`apps/storybook/stories/input.stories.ts` 覆盖全部属性的 controls 与状态 story。

排除项（沿用复刻规范 §1.2 / §3）：
- antd `Input.Group` 与 `addonBefore` / `addonAfter`（已废弃，改用 `Space.Compact`；OOA 无 Space.Compact，对应 demo 不建）。
- 所有 `debug` 标记 demo（`addon` / `group` / `variant`/`filled`/`borderless`/`align`/`textarea-resize`/`debug-addon`/`component-token`）。
- 依赖 OOA 没有的辅助组件（Tooltip / Radio.Group / Space.Compact）的交互型 demo，按规范改静态多行展示或省略。

## Capabilities

### New Capabilities
- `input`: OOA Input 组件族对 antd v6 的 1:1 复刻能力 — 描述 Input / TextArea / Password / Search / OTP 的 DOM 结构、类名、事件、状态与行为要求。

### Modified Capabilities
（无 — 本变更不修改既有能力。）

## Impact

- `packages/components/src/components/input/` — 新增全部组件模块（主元素 / helpers / icons / style / `__tests__`）。
- `packages/components/src/index.ts` — 增加 input 组件族导出。
- `apps/parity/src/cases/input.tsx` + `shared.tsx` + `cases/index.ts` — 新增 input parity case 并注册。
- `apps/storybook/stories/input.stories.ts` — 新增 input story（已有部分草稿）。
- `packages/tokens` — 仅当现有 `--ooa-*` 全局 token 覆盖不足时补组件 token（预计大部分复用，不需要改 theme.css）。
- 依赖：antd `6.5.0`（本地源码 `/Users/weiyuhang/code/myCode/ant-design` + `apps/parity` 依赖版本）。
