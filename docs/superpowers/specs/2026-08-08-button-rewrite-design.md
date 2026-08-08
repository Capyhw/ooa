# ooa-button v6 重写设计（方案 A：模块镜像）

- 日期：2026-08-08
- 状态：已批准（用户已在会话中确认设计，随后进入实现）
- 范围：仅 `ooa-button`；其他组件按同一范式后续迁移
- 目标：1:1 复刻 antd v6（master）Button 的渲染结果与行为

## 背景与决策摘要

旧 `ooa-button.ts` 是单文件实现，按 v5（5.21 之前）的 `type` 单轴模型编写；antd master 已演进为 `color × variant` 双轴模型，且 Button 源码本就拆分为约 8 个模块。单文件无法承载 v6 API 面。

已确认决策：

| 决策点 | 结论 |
|---|---|
| 重写范围 | 仅 Button |
| 目录结构 | 方案 A：`src/components/button/` 模块镜像 antd |
| API 覆盖 | 全量复刻（双轴 + 预设色 + danger 全组合 + ghost 新语义 + anchor + loading{delay,icon} + 两汉字 + iconPlacement + icon-only + square + Button.Group） |
| Wave 涟漪 | 延后 |
| 验证方式 | parity 矩阵扩充 + Vitest **v4** browser mode（playwright 驱动真实 Chromium） |
| 主题机制 | 维持构建时同步（`sync-antd-tokens.mjs` → `theme.css`）；运行时 seed 助手作为未来扩展，本轮不做 |
| Space.Compact / prefixCls / 主题算法 | 本轮不做（理由见下） |

### 不做项的简短理由

- **Space.Compact**：属于 `Space` 组件；没有 `ooa-space`/`ooa-compact` 提供 context 前，按钮侧 compact 支持是死代码。Button.Group 在本轮做（文件在 button 目录内，且 antd 仍保留）。
- **prefixCls**：antd 的 CSS-in-JS 类名前缀机制，Web Component 由自定义元素标签 + `::part()` 替代，无法也不需要移植。
- **主题算法运行时化**：`sync-antd-tokens.mjs` 已在构建时调用 antd 的 `getDesignToken()`/`darkAlgorithm`，产出的 `--ooa-*` 值与 antd 运行时一致（脚本头注释明确）。差异只剩「运行时改 seed 实时重算」——这是 React 生态心智，CSS 自定义属性才是 Web Component 的原生主题机制。默认零成本纯 CSS 切换，运行时 seed 助手（`applyTheme(el, { seed, algorithm })` 写 `--ooa-*` 到 provider 宿主）留作未来扩展。

## §1 目录与模块职责

```
packages/components/src/components/button/
  ooa-button.ts            # OoaButton 主元素（对位 Button.tsx）
  button-helpers.ts        # 纯函数与类型，无 lit 依赖（对位 buttonHelpers.tsx）
  button-group.ts          # <ooa-button-group> + groupSizeContext（对位 ButtonGroup.tsx）
  icon-wrapper.ts          # IconWrapper 渲染函数（对位 IconWrapper.tsx）
  default-loading-icon.ts  # DefaultLoadingIcon 渲染函数（对位 DefaultLoadingIcon.tsx）
  style/
    index.ts               # 组合导出 buttonStyles: CSSResult[]（对位 style/index.ts）
    token.ts               # --ooa-* 全局 token → --ooa-btn-* 组件变量（对位 style/token.ts）
    variant.ts             # color × variant 双轴变量 + 共享模板（对位 style/variant.ts）
    group.ts               # 组边框合并（对位 style/group.ts）
```

- `button-helpers.ts`：类型（`ButtonType` / `ButtonShape` 含 square / `ButtonColorType` / `ButtonVariantType` / `ButtonHTMLType`）+ `ButtonTypeMap` + `resolveColorVariant()`（移植 antd 两个 useMemo：parsed + ghost 降级）+ `isTwoCNChar` / `getLoadingConfig` / `isUnBorderedVariant`。
- `style/*.ts` 导出 `css` 模板；`ooa-button.ts` 的 `static styles = [baseControlStyles, ...buttonStyles]` 组合消费。
- 对外入口 `packages/components/src/index.ts` 更新导出路径。

## §2 对外 attribute API

| antd prop | ooa attribute | 说明 |
|---|---|---|
| `type` | `type` | legacy 糖（经 `ButtonTypeMap` 推导），保留以兼容 parity 现有用例 |
| `color` | `color` | default/primary/danger + 10 预设色（red/volcano/orange/gold/lime/green/cyan/blue/geekblue/purple/magenta） |
| `variant` | `variant` | outlined/dashed/solid/filled/text/link |
| `danger` | `danger` | boolean；解析为 `-dangerous` 类 |
| `ghost` | `ghost` | boolean；新语义（见 §3） |
| `block` | `block` | boolean |
| `loading` | `loading` + `loading-delay` | antd 的 `{delay, icon}` 对象拆成 bool + 数值属性 |
| `loadingIcon` | `slot="loading-icon"` | antd `loading.icon` / 全局 loadingIcon 的 WC 等价 |
| `icon` | `slot="icon"` | 已有 |
| `iconPlacement` / `iconPosition` | `icon-placement` | `position` 为废弃别名，映射同一属性 |
| `shape` | `shape` | default/circle/round/square |
| `size` | `size` | small/medium/large；`middle` 作废弃别名归一化为 `medium` |
| `href` / `target` | 同 | 触发 anchor 分支 |
| `htmlType` | `html-type` | |
| `autoInsertSpace` | `auto-insert-space` | 两汉字插空格 |
| `autoFocus` | `auto-focus` | |
| `classNames`/`styles` | `part="root\|icon\|content"` + CSS 变量 | 语义化定制的 WC 等价 |
| 点击阻断 | 原生 click：`loading \|\| disabled → preventDefault` | 对齐 antd handleClick |

size 解析链：`size ?? groupSize ?? config.componentSize`；small → `-sm` 类、large → `-lg` 类（medium 无类）。

## §3 状态与行为

- **variant/color 推导**：`resolveColorVariant({ type, color, variant, danger, ghost })` 一次算出 `[color, variant]`，规则对齐 antd `useMemo`：
  - `color && variant` 直接用；`type || danger` 走 `ButtonTypeMap`（danger 时 color→danger 保留 variant）；`variant==='solid'` 且无 color → color=primary；无 → `['default','outlined']`。
  - ghost：`parsedVariant==='solid'` 时降级为 `outlined`。
- **danger 组合**：`danger` 只影响 color 轴 → `danger + text` / `danger + link` / `danger + dashed` / `danger + filled` 天然成立（红字 / 红边框 / 红浅底）。
- **loading**：内部 `innerLoading` 状态；`loading-delay > 0` 时定时器延迟置 true（cleanup 防泄漏）；首帧挂载不播动画（对位 `isMountRef`）；loading 时 icon 位换成 loading-icon slot 内容，`aria-busy`，加 `-loading` 类。
- **两汉字**：WC 无法在 render 变换 slot 文本，走 antd 运行时路径——`useEffect` 读宿主 `textContent`，命中（单子节点 + 无 icon + 非 unbordered variant + autoInsertSpace）切 `-two-chinese-chars` 类，CSS 用 `letter-spacing` + 负 `margin-inline-end`。
- **icon-only**：无 children 且有 icon → `-icon-only`（方钮，宽 = control-height）。
- **anchor 分支**：有 `href` → render `<a>`；disabled 时 `href` 移除、`tabindex=-1`、`aria-disabled`、加 `-disabled` 类；点击阻断同上。
- **RTL**：沿用宿主 `dir` + 逻辑属性；额外处理 `-rtl` 需要的显式规则（如有）。

## §4 样式体系

- **token.ts**（对位 `prepareComponentToken`）：声明 `--ooa-btn-*` 组件级变量，全部从全局 `--ooa-*` 解析并带 antd 值兜底：
  - 布局：`padding-inline(-sm/lg)`、`content-font-size(-sm/lg)`、`line-height: 1.5714`（getLineHeight(14)）。
  - 阴影：default/primary/danger + 10 预设色 `shadow-color`，形态 `0 var(--ooa-control-outline-width) 0 <outline色>`。
  - `solid-text-color`：`color-contrast(var(--ooa-color-bg-solid) vs #000, #fff)`（等价 antd `isBright` 判断）。
  - `only-icon-size(-sm/lg)`、`text-*` 色（textTextColor/hover/active、textHoverBg、linkHoverBg）、`default-ghost-color`、`ghost-bg`、`group-border-color`。
- **variant.ts**（对位 `variant.ts` 逐段）：共享模板段（base 从 `--ooa-btn-*` 消费）→ hover/active 段 → 6 个 variant 段（solid/outlined+dashed/dashed/filled/text+link/text）→ 颜色段（default/primary/danger/10 预设色）→ disabled 段 → ghost 段。**不写死任何颜色**，全部走变量。
- **index.ts**：组合 `[baseControlStyles, token, variant, shape/size/block/loading/icon-only/两汉字, group]`。
- 现有 `:host([type=...])` 枚举式写法删除，替换为 `:host` 上声明 `--ooa-btn-*` + 共享模板。

## §5 Button.Group

- `ooa-button-group` 渲染 `<span class="ooa-btn-group">`（对位 `.ant-btn-group`），经 `@lit/context` provide `groupSizeContext`；组内按钮在 size 解析链中消费它。
- `style/group.ts`：相邻按钮边框合并（`-group` 子选择器）、首尾圆角、hover/active 时 `z-index` 抬升防重叠、组内按钮不单独设圆角。
- 组边框颜色用 `--ooa-btn-group-border-color`（= colorPrimaryHover，对位 antd groupBorderColor）。

## §6 测试（Vitest v4 browser mode）

- 依赖：`vitest@^4` + `@vitest/browser@^4`（playwright provider，真实 Chromium）。
- 位置：`packages/components/src/components/button/__tests__/ooa-button.test.ts`（`@lit/testing` fixture）。
- turbo 增加 `test` task；`packages/components` 增加 `test` script。
- 用例覆盖：
  - 属性反射（type/color/variant/danger/ghost/block/shape/size/loading/html-type…）
  - variant·color 推导 → 类名断言（`-color-*` / `-variant-*` / `-dangerous`）+ 计算样式断言（关键 `--ooa-btn-*` 变量值）
  - ghost 降级（solid→outlined）、ghost 非 text/link 类
  - danger + text/link 红字、danger + primary 实心红
  - anchor 分支（href 存在、disabled 时 href 移除 / tabindex=-1 / aria-disabled / `-disabled`）
  - loading-delay 假定时器、loading 时 aria-busy + loading-icon 替换
  - 两汉字类切换（content 变、auto-insert-space=false 关闭）
  - icon-only 方钮、icon-placement end
  - group size context 传递
  - disabled 组合与 config.disabled

## §7 parity + storybook

- **parity** `cases/button.tsx` 扩成矩阵：variant × color（含预设色）× shape × states（loading/ghost/danger/disabled/icon/icon-placement/anchor/group），两侧并排；`types.ts` 的 `ParityComponent` 已含 button。
- **storybook** `button.stories.ts` 同步新 args（variant/color/shape），保留 ConfigProviderSize 示例。

## §8 本轮不做

- Wave 点击涟漪
- Space.Compact（按钮侧 compact 样式）
- prefixCls / CSS-in-JS 主题算法运行时化
- 运行时 seed 助手（`applyTheme`）
- 其他组件（input/text/textarea/password/search/otp）迁移

## 兼容性要求

- `<ooa-button>` 自定义元素标签保持不变（parity / storybook / 文档继续可用）。
- `type` attribute 继续可用（legacy 糖）。
- 保留 `size` 对 `middle` 的接受（归一化为 medium），不破坏现有 config-provider `component-size="middle"` 默认值。
