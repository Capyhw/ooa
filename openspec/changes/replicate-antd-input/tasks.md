## 1. Phase 0-1 · API 摸底与骨架

- [x] 1.1 用 antd skill 摸底 Input 家族 API：`antd info Input --version 6.5.0 --format json`（含 TextArea / Password / Search / OTP），记录 props、deprecated 标注（bordered / addonBefore / addonAfter / Input.Group）与 `count` 对象 API 为非目标
- [x] 1.2 核对 `packages/components/src/components/input/` 模块骨架与 `index.ts` 导出（ooa-input / ooa-textarea / ooa-password / ooa-search / ooa-otp）

## 2. Phase 2 · helpers 纯逻辑 + 单测

- [x] 2.1 核对 `input-helpers.ts` 五个纯函数对位 antd：`resolveVariant`（bordered→borderless）、`resolveSize`（medium→middle）、`formatCount`、`shouldShowClear`、`isPureTextArea`
- [x] 2.2 `input-helpers.test.ts` 覆盖全部推导规则（已有，确认绿）

## 3. Phase 3 · style 模块

- [x] 3.1 `style/token.ts`：`--ooa-input-*` 组件 token 全带 `var(--ooa-x, <字面量>)` fallback，padding/字号/shadow 公式用 CSS calc/max 表达 antd JS 计算；parity 实测 middle `4px 11px` / small `0px 7px` / large `7px 11px`
- [x] 3.2 `style/variant.ts`：四种变体（outlined / borderless / filled / underlined）对位 antd `style/variants.ts`
- [x] 3.3 `style/affix.ts`：affix-wrapper 边框合并 / 聚焦态 / clear 图标 / 计数后缀
- [x] 3.4 `style/textarea.ts`：textarea / data-count / autoSize 高度

## 4. Phase 4 · 主元素 ooa-input

- [x] 4.1 裸分支 vs affix 分支 DOM 与类名对齐 antd（变体/状态/out-of-range 类只落在最外层对应元素）
- [x] 4.2 受控 value + `ooa-change`（bubbles+composed，detail={value,sourceEvent}）+ IME 组合抑制与 compositionend 补发
- [x] 4.3 `allowClear`（可见性 / 点击清空回焦 / mousedown preventDefault）与 `showCount`（`count / max` 文本 / out-of-range）
- [x] 4.4 prefix / suffix 经 light DOM slot + MutationObserver 驱动 affix 分支与 slot 渲染
- [x] 4.5 variant / size / status / disabled 解析：组件属性优先、全局 `ooa-config-provider` 兜底、`bordered` 旧 API 归一化
- [x] 4.6 RTL：`ooa-input-rtl` / `ooa-input-affix-wrapper-rtl` 类

## 5. Phase 5 · 扩展复合件

- [x] 5.1 `ooa-textarea`：裸/affix 分支、`ooa-input-data-count` + wrapper `data-count`、`auto-size` 布尔形式高度自适应
- [x] 5.2 `ooa-password`：子类化复用 ooa-input，type 切换不触发 change、eye 图标键盘可达（role/aria/tabindex）、`visibility-toggle=false` 无图标
- [x] 5.3 `ooa-search`：ooa-input + 按钮组合、change 透传（stopPropagation）、Enter/按钮派发 `ooa-search`、`enter-button` / `loading` / `disabled`、边框近似合并（补 `allow-clear` 透传）
- [x] 5.4 `ooa-otp`：`patchCells`（单字符覆盖/多字符粘贴分发）、ArrowLeft/Right / 空格 Backspace / Ctrl/Cmd+Z 阻止、聚焦选全与跳空格、mask（true→password / 字符串→覆盖层）、separator、`ooa-change` 全格填满才触发、auto-focus
- [x] 5.5 `ooa-otp` 补全 `formatter`（输入文本先过 formatter，对位 antd `internalFormatter`，覆盖 spec「formatter 格式化」场景）

## 6. Phase 6 · parity case（照搬官网示例页）

- [x] 6.1 `shared.tsx` 增加 `OoaInput` / `OoaTextArea` / `OoaPassword` / `OoaSearch` / `OoaOtp` React 包装：createElement 渲染自定义元素 + slot 子节点 + `ooa-*` 事件桥接成 React 回调
- [x] 6.2 按官网 `index.zh-CN.md` 代码演示清单重写 `apps/parity/src/cases/input.tsx`，OOA 与 antd 两侧对称铺满以下 DemoBlock（标题沿用官网中文名）：基本使用、三种大小、形态变体、搜索框、搜索框 loading、文本域、适应文本高度的文本域、一次性密码框、密码框、带移除图标、带字数提示、自定义状态、前缀和后缀（后缀 Tooltip 省略为纯图标）、聚焦（按钮/开关交互简化为静态展示）
- [x] 6.3 受控值（value）经 `CaseContext` 在 OOA 与 antd 两侧共享；size / disabled / theme / direction 只走外层 ConfigProvider 全局下发，不在 case 内重复传
- [x] 6.4 确认不建：advance-count（count 对象 API）、compact-style 与 search-input 的 Space.Compact / Space.Addon 部分、tooltip、style-class（antd-style 语义 API）、group / addon 等 debug 与废弃 demo
- [x] 6.5 `cases/index.ts` 注册 `INPUT_CASES`，状态进 URL query（`?case=input&theme=&size=…`）

## 7. Phase 7 · 组件测试（Vitest v4 browser）

- [x] 7.1 `ooa-input` DOM/行为测试（已有：裸/affix 类、change、IME、clear、out-of-range；补 RTL 与 prefix/suffix slot 用例）
- [x] 7.2 `ooa-textarea` 测试（已有：裸/affix/data-count/allowClear/autoSize）
- [x] 7.3 `ooa-password` 测试（已有：结构/切换/visibility-toggle/disabled/键盘/不触发 change）
- [x] 7.4 `ooa-search` 测试（新增：change 透传、Enter 与按钮触发 ooa-search、loading/disabled 禁用、enter-button 渲染）
- [x] 7.5 `ooa-otp` 测试（新增：单字符前进、粘贴分发、键盘导航、mask 覆盖层、separator、全格填满触发 ooa-change、formatter）

## 8. Phase 8 · storybook

- [x] 8.1 `input.stories.ts`：`ooa-input` argTypes 覆盖全部属性（variant / status / size / type / maxLength / allowClear / showCount / disabled / readOnly）+ prefix/suffix slot story
- [x] 8.2 补 textarea / password / search / otp 的 controls story 与状态 story（error / warning / 双轴 / disabled）

## 9. Phase 9 · 验收

- [x] 9.1 `pnpm dev` 打开 parity，light / dark / LTR / RTL / size / disabled 各轴并排核对 OOA 与本地 antd 的 DOM 结构与计算样式
- [x] 9.2 `pnpm build` 全绿（组件包 + docs + storybook）

## 10. Phase 10 · 提交

- [x] 10.1 按职责单一分批提交（helpers→style→主元素→复合件→parity→测试→storybook→token），scope 用 `input`，遵循 Conventional Commits 与 docs/component-replication.md §6
