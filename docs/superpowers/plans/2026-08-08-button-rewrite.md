# ooa-button v6 重写 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已批准设计（`docs/superpowers/specs/2026-08-08-button-rewrite-design.md`）把 `ooa-button` 从单文件重写为 antd v6 风格的模块镜像目录，1:1 复刻 v6 Button 的渲染结果与行为。

**Architecture:** `packages/components/src/components/button/` 目录镜像 antd `components/button/`：主元素 `ooa-button.ts`（对位 Button.tsx）、纯函数 `button-helpers.ts`（对位 buttonHelpers.tsx）、`button-group.ts`（对位 ButtonGroup.tsx）、`icon-wrapper.ts` + `default-loading-icon.ts`（对位 IconWrapper/DefaultLoadingIcon）、`style/{index,token,variant,group}.ts` 以 `css` 模板镜像 CSS-in-JS。样式走 v6 的 `color × variant` 双轴 CSS 变量体系：`style/variant.ts` 按变体/颜色声明 `--ooa-btn-*` 变量，共享模板统一消费。测试用 Vitest v4 browser mode（playwright 真实 Chromium）。

**Tech Stack:** Lit 3 + `@lit/context`、TypeScript 6、Vite 8、Vitest 4 + `@vitest/browser` + playwright、pnpm 9 workspace、Turbo。

---

## 全局规则（每个任务都必须遵守）

- **工作区有大量用户未提交的暂存 WIP（脚手架）。绝不执行 `git add -A`、`git commit -a` 或裸 `git commit`——那会把用户 WIP 一并提交。** 每个提交只用 pathspec：`git commit <具体路径...> -m "..."`。
- 所有新增文件都以 `ooa-` 或模块名命名，放在 `packages/components/src/components/button/` 下。
- 严格类型检查（`tsc --noEmit`）必须通过；未使用变量/参数会导致失败。
- 先写测试、跑红、再实现、跑绿、提交。CSS 模块无法单独测试，由后续元素测试覆盖——创建后即提交，不需单独测试。
- 提交信息遵循项目惯例（见 AGENTS.md）：简洁 Conventional Commits，如 `feat(button): 重写为 v6 双轴模型`。不加 TaskID（项目无此约定）。
- 参考 antd master 源码时用 v6：`https://raw.githubusercontent.com/ant-design/ant-design/master/components/button/...`。

---

## Task 0: Vitest v4 browser mode 测试基建

**Files:**
- Modify: `packages/components/package.json`
- Create: `packages/components/vitest.config.ts`
- Create: `packages/components/src/smoke.test.ts`（临时，Task 0 末尾删除）
- Modify: `turbo.json`
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

在 `packages/components` 下运行：

```bash
pnpm --filter @ooa/components add -D vitest@^4 @vitest/browser@^4 playwright @open-wc/testing
```

预期：`packages/components/package.json` devDependencies 出现 4 个新依赖。

- [ ] **Step 2: 创建 vitest.config.ts**

创建 `packages/components/vitest.config.ts`（alias 与现有 `vite.config.ts` 完全一致，测试无需构建 tokens）：

```ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@ooa/tokens/theme.css': fileURLToPath(new URL('../tokens/src/theme.css', import.meta.url)),
      '@ooa/tokens': fileURLToPath(new URL('../tokens/src/index.ts', import.meta.url)),
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    },
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: 安装 playwright 浏览器**

```bash
pnpm --filter @ooa/components exec playwright install chromium
```

预期：chromium 下载完成，无报错。

- [ ] **Step 4: 加 test script + 冒烟测试**

`packages/components/package.json` 的 `scripts` 增加：`"test": "vitest run"`。

创建 `packages/components/src/smoke.test.ts`：

```ts
import { html, fixture } from '@open-wc/testing';
import { expect } from 'vitest';

it('冒烟：渲染自定义元素', async () => {
  const el = await fixture(html`<div>smoke</div>`);
  expect(el.textContent).toBe('smoke');
});
```

- [ ] **Step 5: 运行测试**

```bash
pnpm --filter @ooa/components test
```

预期：冒烟用例 PASS（browser mode 拉起 chromium）。

- [ ] **Step 6: 加 turbo test task + 根脚本**

`turbo.json` 的 `tasks` 增加：

```json
"test": { "outputs": [] }
```

`package.json`（根）的 `scripts` 增加：`"test": "turbo run test"`。

- [ ] **Step 7: 删除冒烟文件并提交**

```bash
rm packages/components/src/smoke.test.ts
git commit packages/components/package.json packages/components/vitest.config.ts turbo.json package.json -m "build(components): 搭建 Vitest v4 browser 测试基建"
```

---

## Task 1: button-helpers.ts 纯逻辑模块 + 单测

**Files:**
- Create: `packages/components/src/components/button/button-helpers.ts`
- Test: `packages/components/src/components/button/__tests__/button-helpers.test.ts`

- [ ] **Step 1: 写失败测试**

创建 `packages/components/src/components/button/__tests__/button-helpers.test.ts`：

```ts
import { expect } from 'vitest';
import {
  PRESET_COLORS,
  isTwoCNChar,
  isUnBorderedVariant,
  resolveColorVariant,
  type ButtonColor,
  type ButtonVariant,
} from '../button-helpers.js';

describe('isTwoCNChar', () => {
  it('命中两个汉字', () => {
    expect(isTwoCNChar('按钮')).toBe(true);
    expect(isTwoCNChar('返回')).toBe(true);
  });
  it('未命中', () => {
    expect(isTwoCNChar('按钮组')).toBe(false);
    expect(isTwoCNChar('OK')).toBe(false);
    expect(isTwoCNChar('A')).toBe(false);
  });
});

describe('isUnBorderedVariant', () => {
  it('text/link 无边框', () => {
    expect(isUnBorderedVariant('text')).toBe(true);
    expect(isUnBorderedVariant('link')).toBe(true);
  });
  it('其余有边框', () => {
    expect(isUnBorderedVariant('solid')).toBe(false);
    expect(isUnBorderedVariant('outlined')).toBe(false);
    expect(isUnBorderedVariant('dashed')).toBe(false);
    expect(isUnBorderedVariant('filled')).toBe(false);
  });
});

describe('resolveColorVariant', () => {
  it('缺省为 outlined default', () => {
    expect(resolveColorVariant({})).toEqual({ color: 'default', variant: 'outlined' });
  });
  it('type 语法糖经 ButtonTypeMap 推导', () => {
    expect(resolveColorVariant({ type: 'primary' })).toEqual({ color: 'primary', variant: 'solid' });
    expect(resolveColorVariant({ type: 'dashed' })).toEqual({ color: 'default', variant: 'dashed' });
    expect(resolveColorVariant({ type: 'text' })).toEqual({ color: 'default', variant: 'text' });
    expect(resolveColorVariant({ type: 'link' })).toEqual({ color: 'link', variant: 'link' });
  });
  it('danger 只改 color 轴', () => {
    expect(resolveColorVariant({ danger: true })).toEqual({ color: 'danger', variant: 'outlined' });
    expect(resolveColorVariant({ type: 'primary', danger: true })).toEqual({ color: 'danger', variant: 'solid' });
    expect(resolveColorVariant({ type: 'text', danger: true })).toEqual({ color: 'danger', variant: 'text' });
  });
  it('color+variant 显式优先', () => {
    expect(resolveColorVariant({ color: 'red', variant: 'filled' })).toEqual({ color: 'red', variant: 'filled' });
    expect(resolveColorVariant({ color: 'primary', variant: 'solid', type: 'text' })).toEqual({ color: 'primary', variant: 'solid' });
  });
  it('variant solid 无 color 时 color 归 primary', () => {
    expect(resolveColorVariant({ variant: 'solid' })).toEqual({ color: 'primary', variant: 'solid' });
  });
  it('ghost 把 solid 降级为 outlined', () => {
    expect(resolveColorVariant({ type: 'primary', ghost: true })).toEqual({ color: 'primary', variant: 'outlined' });
    expect(resolveColorVariant({ variant: 'solid', ghost: true })).toEqual({ color: 'primary', variant: 'outlined' });
    expect(resolveColorVariant({ color: 'red', variant: 'solid', ghost: true })).toEqual({ color: 'red', variant: 'outlined' });
    expect(resolveColorVariant({ type: 'text', ghost: true })).toEqual({ color: 'default', variant: 'text' });
  });
  it('preset color 直通', () => {
    for (const c of PRESET_COLORS as readonly ButtonColor[]) {
      expect(resolveColorVariant({ color: c, variant: 'outlined' }).color).toBe(c);
    }
  });
});
```

- [ ] **Step 2: 跑测试确认红**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/button-helpers.test.ts
```

预期：FAIL（`../button-helpers.js` 不存在）。

- [ ] **Step 3: 实现 button-helpers.ts**

创建 `packages/components/src/components/button/button-helpers.ts`（移植自 antd `buttonHelpers.tsx` + `Button.tsx` 的 `ButtonTypeMap` 与两个 useMemo，无 lit 依赖）：

```ts
export type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';
export type ButtonShape = 'default' | 'circle' | 'round' | 'square';
export type ButtonHTMLType = 'submit' | 'button' | 'reset';
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type PresetColor = 'red' | 'volcano' | 'orange' | 'gold' | 'lime' | 'green' | 'cyan' | 'blue' | 'geekblue' | 'purple' | 'magenta';
export type ButtonColor = 'default' | 'primary' | 'danger' | 'link' | PresetColor;

export const BUTTON_TYPES: readonly ButtonType[] = ['default', 'primary', 'dashed', 'link', 'text'];
export const BUTTON_VARIANTS: readonly ButtonVariant[] = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'];
export const PRESET_COLORS: readonly PresetColor[] = ['red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple', 'magenta'];

const rxTwoCNChar = /^[一-龥]{2}$/;
export const isTwoCNChar = (char: string): boolean => rxTwoCNChar.test(char);

export const isUnBorderedVariant = (variant: ButtonVariant): boolean => variant === 'text' || variant === 'link';

export type ColorVariantPair = readonly [color: ButtonColor, variant: ButtonVariant];

/** 对位 antd Button.tsx 的 ButtonTypeMap：type 语法糖 → [color, variant]。 */
export const ButtonTypeMap: Readonly<Record<ButtonType, ColorVariantPair>> = {
  default: ['default', 'outlined'],
  primary: ['primary', 'solid'],
  dashed: ['default', 'dashed'],
  link: ['link', 'link'],
  text: ['default', 'text'],
};

export interface ResolveColorVariantInput {
  type?: ButtonType;
  color?: ButtonColor;
  variant?: ButtonVariant;
  danger?: boolean;
  ghost?: boolean;
}

/**
 * 对位 antd Button.tsx 的两个 useMemo（parsed + merged ghost 降级）。
 * 返回有效的 [color, variant] 对，danger 只作用于 color 轴。
 */
export function resolveColorVariant(input: ResolveColorVariantInput): { color: ButtonColor; variant: ButtonVariant } {
  const { type, color, variant, danger, ghost } = input;

  // >>> Local
  let parsedColor: ButtonColor;
  let parsedVariant: ButtonVariant;
  if (color && variant) {
    [parsedColor, parsedVariant] = [color, variant];
  } else if (type || danger) {
    const pair = ButtonTypeMap[type ?? 'default'];
    if (danger) {
      [parsedColor, parsedVariant] = ['danger', pair[1]];
    } else {
      [parsedColor, parsedVariant] = pair;
    }
  } else if (variant === 'solid') {
    [parsedColor, parsedVariant] = ['primary', 'solid'];
  } else {
    [parsedColor, parsedVariant] = ['default', 'outlined'];
  }

  // >>> Ghost：solid 降级 outlined
  if (ghost && parsedVariant === 'solid') {
    return { color: parsedColor, variant: 'outlined' };
  }
  return { color: parsedColor, variant: parsedVariant };
}

/** 对位 antd getLoadingConfig：loading(boolean) + delay 数值 → 生效配置。 */
export function getLoadingConfig(loading: boolean, delay: number): { loading: boolean; delay: number } {
  const d = Number.isFinite(delay) && delay > 0 ? delay : 0;
  return { loading: d <= 0 ? loading : false, delay: d };
}
```

- [ ] **Step 4: 跑测试确认绿**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/button-helpers.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: 提交**

```bash
git commit packages/components/src/components/button/button-helpers.ts packages/components/src/components/button/__tests__/button-helpers.test.ts -m "feat(button): 新增 button-helpers 纯逻辑模块与单测"
```

---

## Task 2: style 模块（token / variant / index）

**Files:**
- Create: `packages/components/src/components/button/style/token.ts`
- Create: `packages/components/src/components/button/style/variant.ts`
- Create: `packages/components/src/components/button/style/index.ts`

CSS 模块无法单独测试，由 Task 3+ 元素测试覆盖；本任务创建后即提交。

- [ ] **Step 1: style/token.ts**

创建 `packages/components/src/components/button/style/token.ts`。对位 antd `style/token.ts` 的 `prepareComponentToken`，但以 CSS 自定义属性形式表达。声明全部 `--ooa-btn-*` 组件级变量，值从全局 `--ooa-*` 解析并带 antd 值兜底。关键映射（值需对齐 antd，当前 theme.css 已含对应 `--ooa-*`）：

```ts
import { css } from 'lit';

/** 对位 antd Button prepareComponentToken：全局 token → --ooa-btn-* 组件变量。 */
export const buttonTokens = css`
  :host {
    /* 布局尺寸 */
    --ooa-btn-padding-inline: calc(var(--ooa-padding-content-horizontal, 15px) - var(--ooa-line-width, 1px));
    --ooa-btn-padding-inline-sm: calc(8px - var(--ooa-line-width, 1px));
    --ooa-btn-padding-inline-lg: calc(var(--ooa-padding-content-horizontal, 15px) - var(--ooa-line-width, 1px));
    --ooa-btn-content-font-size: var(--ooa-font-size, 14px);
    --ooa-btn-content-font-size-sm: var(--ooa-font-size, 14px);
    --ooa-btn-content-font-size-lg: var(--ooa-font-size-lg, 16px);
    --ooa-btn-content-line-height: 1.5714;
    --ooa-btn-icon-gap: var(--ooa-margin-xs, 8px);
    --ooa-btn-only-icon-size: inherit;
    --ooa-btn-only-icon-size-sm: inherit;
    --ooa-btn-only-icon-size-lg: inherit;

    /* 阴影（0 outline-width 0 outline色） */
    --ooa-btn-default-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-control-tmp-outline, rgba(0, 0, 0, 0.02));
    --ooa-btn-primary-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-control-outline, rgba(5, 145, 255, 0.1));
    --ooa-btn-danger-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-color-error-outline, rgba(255, 38, 5, 0.06));
    --ooa-btn-red-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-red-1, #fff1f0);
    --ooa-btn-volcano-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-volcano-1, #fff2e8);
    --ooa-btn-orange-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-orange-1, #fff7e6);
    --ooa-btn-gold-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-gold-1, #fffbe6);
    --ooa-btn-lime-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-lime-1, #fcffe6);
    --ooa-btn-green-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-green-1, #f6ffed);
    --ooa-btn-cyan-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-cyan-1, #e6fffb);
    --ooa-btn-blue-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-blue-1, #e6f4ff);
    --ooa-btn-geekblue-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-geekblue-1, #f0f5ff);
    --ooa-btn-purple-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-purple-1, #f9f0ff);
    --ooa-btn-magenta-shadow: 0 var(--ooa-control-outline-width, 2px) 0 var(--ooa-magenta-1, #fff0f6);

    /* solid 文字色：等价值判断需在浏览器计算，用 color-contrast 等价 antd isBright */
    --ooa-btn-solid-text-color: color-contrast(var(--ooa-color-bg-solid, #000) vs #000, #fff);

    /* text / link 相关 */
    --ooa-btn-text-text-color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-text-color-hover: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-text-color-active: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    --ooa-btn-text-hover-bg: var(--ooa-color-fill-tertiary, rgba(0, 0, 0, 0.04));
    --ooa-btn-link-hover-bg: transparent;

    /* ghost */
    --ooa-btn-default-ghost-color: var(--ooa-color-bg-container, #fff);
    --ooa-btn-ghost-bg: transparent;

    /* group */
    --ooa-btn-group-border-color: var(--ooa-color-primary-hover, #4096ff);
  }
`;
```

> 注意：`--ooa-btn-*-shadow` 用 `color-mix`/rgba 的预设色 1 号色（`--ooa-red-1` 等），theme.css 已含全部 `-{color}-1`。其余预设色（`--ooa-red-hover`/`-active`、`-2`、`-3`、`-6`）也已存在，variant.ts 使用。

- [ ] **Step 2: style/variant.ts**

创建 `packages/components/src/components/button/style/variant.ts`。**逐段对位 antd `components/button/style/variant.ts`**（已有完整源码，可 WebFetch 核对），把每个 `[varName('...')]` 换成 `--ooa-btn-*`、`varRef('...')` 换成 `var(--ooa-btn-...)`。结构：

1. **共享模板段**（`:host` → `button`）：
   - base：`border: var(--ooa-btn-border-width) var(--ooa-btn-border-style) var(--ooa-btn-border-color)`、`color: var(--ooa-btn-text-color)`、`background-color: var(--ooa-btn-bg-color)`。
   - `button:hover:not(:disabled)`：border/color/background 用 `-hover` 变量。
   - `button:active:not(:disabled)`：用 `-active` 变量。
   - `button:focus-visible`：outline（用 `--ooa-control-outline-width` + `--ooa-color-primary-border`）。
2. **变量声明段**（全部在 `:host`，用 CSS 变量继承进 button）：
   - `--ooa-btn-border-width: var(--ooa-line-width, 1px)`、`--ooa-btn-border-style: solid`、`--ooa-btn-border-color: transparent`（初始占位）、`--ooa-btn-border-color-hover/active/disabled`。
   - `--ooa-btn-text-color(-hover/-active/-disabled)`、`--ooa-btn-bg-color(-hover/-active/-disabled)`、`--ooa-btn-bg-color-container`。
   - `--ooa-btn-color-base/-hover/-active`、`--ooa-btn-color-light/-light-hover/-light-active`（filled 用）、`--ooa-btn-solid-bg-color(-hover/-active)`。
   - `--ooa-btn-shadow`。
3. **variant 段**（`:host([variant="..."])`，只覆盖变量）：
   - `solid`：`solid-bg-color(-hover/-active) = color-base(-hover/-active)`；`border-color: transparent`；`text-color: var(--ooa-btn-solid-text-color)`；`bg-color(-hover/-active) = solid-bg-color(-hover/-active)`；`box-shadow: var(--ooa-btn-shadow)`。
   - `outlined, dashed`：`border-color(-hover/-active) = color-base(-hover/-active)`；`bg-color: var(--ooa-btn-bg-color-container)`；`text-color(-hover/-active) = color-base(-hover/-active)`；`box-shadow`。
   - `dashed`：`border-style: dashed`；`bg-color-disabled: var(--ooa-color-bg-container-disabled, ...)`。
   - `filled`：`border-color: transparent`；`text-color: color-base`；`bg-color(-hover/-active) = color-light(-hover/-active)`。
   - `text, link`：`border-color(-hover/-active/-disabled): transparent`；`text-color(-hover/-active) = color-base(-hover/-active)`；`bg-color(-hover/-active): transparent`。
   - `text`：`bg-color-hover: color-light`；`bg-color-active: color-light-active`（对位 antd text 段）。
4. **颜色段**（`:host([color="..."])`，只覆盖变量；`danger` 用 `:host([danger])` 等价 antd `-color-dangerous`）：
   - `link`（variant link 的默认色，对位 "By Default >>> Link"）：`color-base(-hover/-active) = --ooa-color-link(-hover/-active)`；`bg-color-hover: var(--ooa-btn-link-hover-bg)`。
   - `primary`：`color-base(-hover/-active) = --ooa-color-primary(-hover/-active)`；`color-light(-light-hover/-light-active) = --ooa-color-primary-bg(-bg-hover/-border)`；`shadow: var(--ooa-btn-primary-shadow)`；solid 时 `text-color: var(--ooa-color-text-light-solid, #fff)`。
   - `danger`（`:host([danger])`）：同上换 `--ooa-color-error*` 与 `--ooa-btn-danger-shadow`。
   - `default`：`color-base(-hover/-active) = --ooa-color-border(-secondary?)/...`——**精确对位 antd color-default 段**：
     - `color-base = --ooa-color-border`；`color-hover = --ooa-color-primary-hover`；`color-active = --ooa-color-primary-active`；
     - `color-light(-light-hover/-light-active) = --ooa-color-fill-tertiary/-fill-secondary/-fill`；
     - `text-color(-hover/-active) = --ooa-color-text/--ooa-color-primary-hover/--ooa-color-primary-active`；
     - outlined/dashed 时 `bg-color-container = --ooa-color-bg-container`、`bg-color-hover/active = --ooa-color-bg-container`；
     - text 时 `text-color(-hover/-active) = text-text-color` 三件套、`bg-color-hover = text-hover-bg`；
     - solid 时 `solid-bg-color(-hover/-active) = --ooa-color-bg-solid(-hover/-active)`、`text-color = solid-text-color`；
     - filled/text 时 `text-color-hover/active` 保持 text-color 不变；
     - ghost（`[ghost][variant="outlined"], [ghost][variant="dashed"]` 且 color default）时 `text-color = default-ghost-color`、`border-color = default-ghost-border-color`。
   - **10 预设色**（`:host([color="red"])` …）：`color-base/-hover/-active = --ooa-red/-hover/-active`；`color-light/-light-hover/-light-active = --ooa-red-1/-2/-3`；`shadow = var(--ooa-btn-red-shadow)`。
5. **disabled 段**：`button:disabled` 与 antd `&:disabled, &-disabled`：`cursor: not-allowed`、`border-color: var(--ooa-color-border-disabled)`、`background: var(--ooa-btn-bg-color-disabled)`、`color: var(--ooa-color-text-disabled)`、`box-shadow: none`。
6. **ghost 段**（`:host([ghost])`）：`bg-color(-hover/-active) = var(--ooa-btn-ghost-bg)`、`shadow: none`。

> **重要**：写完后用 WebFetch 拉 antd `style/variant.ts` 逐段核对变量名与组合选择器，确保 `[color="default"]` 的 outlined/text/solid/ghost 子规则覆盖顺序一致。**不要写死任何颜色值**——全部 `var(--ooa-*)` + antd 兜底。

- [ ] **Step 3: style/index.ts**

创建 `packages/components/src/components/button/style/index.ts`：

```ts
import { baseControlStyles } from '../../styles.js';
import { buttonTokens } from './token.js';
import { buttonVariantStyles } from './variant.js';
import { buttonShapeSizeStyles } from './shape-size.js'; // 见 Step 4

/** 组合导出的 Button 全部样式。Task 6 创建 group.js 后在此补 import 并加入数组。 */
export const buttonStyles = [
  baseControlStyles,
  buttonTokens,
  buttonVariantStyles,
  buttonShapeSizeStyles,
  // buttonGroupStyles, // ← Task 6 启用（连同顶部 import 一并补上）
];
```

- [ ] **Step 4: style/shape-size.ts（shared/圆/方/尺寸/block/loading/icon/两汉字）**

创建 `packages/components/src/components/button/style/shape-size.ts`。对位 antd `style/index.ts` 的 `genSharedButtonStyle` / `genCircleButtonStyle` / `genButtonStyle` / `genBlockButtonStyle` 中非 variant 部分：

```ts
import { css } from 'lit';

/** 布局/形状/尺寸/block/loading/icon-only/两汉字 等共享规则（对位 antd genSharedButtonStyle 等）。 */
export const buttonShapeSizeStyles = css`
  :host { display: inline-block; }
  :host([block]) { display: block; }

  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ooa-btn-icon-gap, 8px);
    min-width: 0;
    height: var(--ooa-control-height, 32px);
    margin: 0;
    padding: 0 var(--ooa-btn-padding-inline, 15px);
    font: inherit;
    font-size: var(--ooa-btn-content-font-size, 14px);
    font-weight: 400;
    line-height: var(--ooa-btn-content-line-height, 1.5714);
    white-space: nowrap;
    text-align: center;
    cursor: pointer;
    border-radius: var(--ooa-border-radius, 6px);
    transition: color var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      border-color var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      background var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease),
      box-shadow var(--ooa-motion-duration-mid, 0.2s) var(--ooa-motion-ease-in-out, ease);
  }

  /* 形状（shape 是宿主属性，用 :host([shape=...])；其余派生类加在内部 button 上） */
  :host([shape="round"]) button { border-radius: 999px; }
  :host([shape="circle"]) button { min-width: var(--ooa-control-height, 32px); padding-inline: 0; border-radius: 50%; }
  :host([shape="square"]) button { min-width: var(--ooa-control-height, 32px); padding-inline: 0; }

  /* 尺寸（v6：medium 无类；small/large 加类，由元素负责加 -sm/-lg）
     类加在内部 button 上（对齐 antd DOM），选择器用 button.ooa-btn-* */
  button.ooa-btn-sm { height: var(--ooa-control-height-sm, 24px); padding-inline: var(--ooa-btn-padding-inline-sm, 7px); font-size: var(--ooa-btn-content-font-size-sm, 14px); }
  button.ooa-btn-lg { height: var(--ooa-control-height-lg, 40px); padding-inline: var(--ooa-btn-padding-inline-lg, 15px); font-size: var(--ooa-btn-content-font-size-lg, 16px); }

  /* icon-only 方钮 */
  button.ooa-btn-icon-only { min-width: var(--ooa-control-height, 32px); padding-inline: 0; }

  /* block */
  :host([block]) button { width: 100%; }

  /* loading */
  button.ooa-btn-loading { cursor: default; }
  .ooa-btn-spin { animation: ooa-btn-spin 0.8s linear infinite; }
  @keyframes ooa-btn-spin { to { transform: rotate(360deg); } }

  /* 两汉字 */
  button.ooa-btn-two-chinese-chars { letter-spacing: 0.3em; }
  button.ooa-btn-two-chinese-chars::after { content: ''; letter-spacing: 0; margin-inline-end: -0.3em; }

  /* icon end */
  button.ooa-btn-icon-end { flex-direction: row-reverse; }
`;
```

> 说明：所有派生类名（`-color-*`/`-variant-*`/`-sm`/`-lg`/`-icon-only`/`-loading`/`-two-chinese-chars`/`-icon-end`/`-background-ghost`）**统一由元素加到内部 `<button>` 的 `class` 上**（对齐 antd：类在 button 元素上），CSS 用 `button.ooa-btn-*` 选择器，测试断言 `getButton(el).classList`。宿主反射属性（`type`/`color`/`variant`/`danger`/`ghost`/`shape`/`block`/`size`）保持可用，供消费者与 `:host([...])` 选择器使用。

- [ ] **Step 5: 提交**

```bash
git commit packages/components/src/components/button/style/ -m "feat(button): 新增 style 模块（token/variant/shape-size）"
```

---

## Task 3: ooa-button.ts 主元素（核心渲染 + variant/color + 基础状态）+ 测试

**Files:**
- Create: `packages/components/src/components/button/ooa-button.ts`
- Test: `packages/components/src/components/button/__tests__/ooa-button.test.ts`

- [ ] **Step 1: 写失败测试（核心状态）**

创建 `packages/components/src/components/button/__tests__/ooa-button.test.ts`（本任务先覆盖 variant/color/基础状态；loading/icon/anchor 等在 Task 5 追加用例）：

```ts
import { html, fixture } from '@open-wc/testing';
import { expect } from 'vitest';
import '../ooa-button.js';

function getButton(el: HTMLElement): HTMLButtonElement {
  const b = el.shadowRoot?.querySelector('button');
  if (!b) throw new Error('no <button> in shadow root');
  return b;
}

async function renderButton(attrs: Record<string, unknown> = {}, text = '确定') {
  return fixture<HTMLElement>(html`<ooa-button ${Object.entries(attrs)
    .map(([k, v]) => (typeof v === 'boolean' ? (v ? `${k}` : '') : `${k}="${v}"`))
    .join(' ')}>${text}</ooa-button>`);
}

describe('variant / color 推导 → 类名（断言内部 button 的 class，对齐 antd DOM）', () => {
  it('type 语法糖映射', async () => {
    const el = await renderButton({ type: 'primary' });
    expect(getButton(el).classList.contains('ooa-btn-color-primary')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-solid')).toBe(true);
  });
  it('color+variant 双轴', async () => {
    const el = await renderButton({ color: 'red', variant: 'filled' });
    expect(getButton(el).classList.contains('ooa-btn-color-red')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-filled')).toBe(true);
  });
  it('danger → -color-dangerous', async () => {
    const el = await renderButton({ type: 'primary', danger: true });
    expect(getButton(el).classList.contains('ooa-btn-color-dangerous')).toBe(true);
  });
  it('ghost 把 solid 降级 outlined', async () => {
    const el = await renderButton({ type: 'primary', ghost: true });
    expect(getButton(el).classList.contains('ooa-btn-variant-outlined')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-solid')).toBe(false);
    expect(getButton(el).classList.contains('ooa-btn-background-ghost')).toBe(true);
  });
  it('text/link 不加 background-ghost', async () => {
    const el = await renderButton({ type: 'text', ghost: true });
    expect(getButton(el).classList.contains('ooa-btn-background-ghost')).toBe(false);
  });
  it('默认 outlined default', async () => {
    const el = await renderButton();
    expect(getButton(el).classList.contains('ooa-btn-color-default')).toBe(true);
    expect(getButton(el).classList.contains('ooa-btn-variant-outlined')).toBe(true);
  });
});

describe('计算样式走 --ooa-btn-* 变量', () => {
  it('danger+primary 实心红', async () => {
    const el = await renderButton({ type: 'primary', danger: true });
    const style = getComputedStyle(getButton(el));
    expect(style.backgroundColor).toBe('rgb(255, 77, 79)'); // colorError #ff4d4f
    expect(style.color).toBe('rgb(255, 255, 255)'); // textLightSolid
  });
  it('danger+text 文字为红', async () => {
    const el = await renderButton({ type: 'text', danger: true });
    expect(getComputedStyle(getButton(el)).color).toBe('rgb(255, 77, 79)');
  });
  it('solid text 颜色由 color-contrast 推导', async () => {
    const el = await renderButton({ color: 'default', variant: 'solid' });
    // colorBgSolid 为黑色时 text 为白
    expect(getComputedStyle(getButton(el)).color).toBe('rgb(255, 255, 255)');
  });
});

describe('形状 / 尺寸 / block', () => {
  it('shape 类', async () => {
    expect(getButton(await renderButton({ shape: 'circle' })).classList.contains('ooa-btn-circle')).toBe(true);
    expect(getButton(await renderButton({ shape: 'round' })).classList.contains('ooa-btn-round')).toBe(true);
    expect(getButton(await renderButton({ shape: 'square' })).classList.contains('ooa-btn-square')).toBe(false); // antd: square 无类
  });
  it('size → -sm/-lg 类（medium/middle 均无类）', async () => {
    expect(getButton(await renderButton({ size: 'small' })).classList.contains('ooa-btn-sm')).toBe(true);
    expect(getButton(await renderButton({ size: 'large' })).classList.contains('ooa-btn-lg')).toBe(true);
    expect(getButton(await renderButton({ size: 'medium' })).classList.contains('ooa-btn-sm')).toBe(false);
    expect(getButton(await renderButton({ size: 'medium' })).classList.contains('ooa-btn-lg')).toBe(false);
  });
  it('block', async () => {
    const el = await renderButton({ block: true });
    expect(getComputedStyle(getButton(el)).width).toBe('100%');
  });
});

describe('disabled', () => {
  it('button disabled + 样式', async () => {
    const el = await renderButton({ disabled: true });
    const btn = getButton(el);
    expect(btn.disabled).toBe(true);
    expect(getComputedStyle(btn).cursor).toBe('not-allowed');
  });
});
```

- [ ] **Step 2: 跑测试确认红**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/ooa-button.test.ts
```

预期：FAIL（`../ooa-button.js` 不存在）。

- [ ] **Step 3: 实现 ooa-button.ts（核心部分）**

创建 `packages/components/src/components/button/ooa-button.ts`。**对位 antd `Button.tsx`，把 React 概念映射到 Lit**。本任务实现核心渲染；loading/icon/anchor/两汉字 在 Task 5 补齐。骨架：

```ts
import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultOoaConfig, ooaConfigContext, type OoaConfig, type OoaSize } from '../../config/context.js';
import { buttonStyles } from './style/index.js';
import {
  resolveColorVariant,
  isUnBorderedVariant,
  type ButtonColor,
  type ButtonHTMLType,
  type ButtonShape,
  type ButtonType,
  type ButtonVariant,
} from './button-helpers.js';

@customElement('ooa-button')
export class OoaButton extends LitElement {
  @property({ reflect: true }) type: ButtonType | undefined = undefined;
  @property({ reflect: true }) color: ButtonColor | undefined = undefined;
  @property({ reflect: true }) variant: ButtonVariant | undefined = undefined;
  @property({ type: Boolean, reflect: true }) danger = false;
  @property({ type: Boolean, reflect: true }) ghost = false;
  @property({ type: Boolean, reflect: true }) block = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Number, attribute: 'loading-delay', reflect: true }) loadingDelay = 0;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true }) shape: ButtonShape | undefined = undefined;
  /** v6 用 medium；middle 为废弃别名（mergedSize 归一化）。 */
  @property({ reflect: true }) size: OoaSize | 'medium' | undefined = undefined;
  @property({ attribute: 'icon-placement', reflect: true }) iconPlacement: 'start' | 'end' = 'start';
  @property({ reflect: true }) href: string | undefined = undefined;
  @property({ reflect: true }) target: string | undefined = undefined;
  @property({ attribute: 'html-type', reflect: true }) htmlType: ButtonHTMLType = 'button';
  @property({ type: Boolean, attribute: 'auto-insert-space', reflect: true }) autoInsertSpace: boolean | undefined = undefined;
  @property({ type: Boolean, attribute: 'auto-focus', reflect: true }) autoFocus = false;

  @consume({ context: ooaConfigContext, subscribe: true })
  @property({ attribute: false })
  protected config: OoaConfig = defaultOoaConfig;

  static styles = buttonStyles;

  private get mergedShape(): ButtonShape { return this.shape ?? 'default'; }
  /** medium/middle 均视为 v6 medium（无类）；归一化避免类型发散。 */
  private get mergedSize(): OoaSize {
    const s = this.size ?? this.groupSize ?? this.config.componentSize;
    return s === 'medium' ? 'middle' : s;
  }

  /** Task 6 由 button-group 提供；本任务先置 undefined。 */
  protected groupSize: OoaSize | undefined = undefined;

  private get colorVariant() {
    return resolveColorVariant({
      type: this.type,
      color: this.color,
      variant: this.variant,
      danger: this.danger,
      ghost: this.ghost,
    });
  }

  // >>> 类名拼装（对位 antd classes；类加在内部 button 上）
  private buildClasses(): string {
    const { color, variant } = this.colorVariant;
    const isDanger = color === 'danger';
    const mergedColorText = isDanger ? 'dangerous' : color;
    const unbordered = isUnBorderedVariant(variant);
    const size = this.mergedSize;
    return [
      'ooa-btn',
      this.mergedShape !== 'default' && this.mergedShape !== 'square' ? `ooa-btn-${this.mergedShape}` : '',
      `ooa-btn-color-${mergedColorText}`,
      `ooa-btn-variant-${variant}`,
      size === 'large' ? 'ooa-btn-lg' : '',
      size === 'small' ? 'ooa-btn-sm' : '',
      this.ghost && !unbordered ? 'ooa-btn-background-ghost' : '',
      this.danger ? 'ooa-btn-dangerous' : '',
      // Task 5 追加：-loading / -icon-only / -two-chinese-chars / -icon-end
    ].filter(Boolean).join(' ');
  }

  override render() {
    const classes = this.buildClasses();
    const content = html`<span part="content"><slot></slot></span>`;

    if (this.href !== undefined) {
      const disabled = this.disabled || this.config.disabled;
      return html`
        <a
          class=${classes}
          href=${disabled ? nothing : this.href}
          target=${this.target ?? nothing}
          ?aria-disabled=${disabled}
          tabindex=${disabled ? -1 : 0}
          @click=${this.handleClick}
        >${content}</a>`;
    }

    const disabled = this.disabled || this.config.disabled;
    return html`
      <button
        type=${this.htmlType}
        class=${classes}
        ?disabled=${disabled}
        @click=${this.handleClick}
      >${content}</button>`;
  }

  private handleClick(e: Event) {
    // 对位 antd handleClick：loading || disabled → preventDefault
    const disabled = this.disabled || this.config.disabled;
    if (this.loading || disabled) {
      e.preventDefault();
      return;
    }
    // 原生 click 事件已由浏览器派发，无需转发
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-button': OoaButton; }
}
```

> 说明：`buildClasses` 里 shape 类逻辑对位 antd：`mergedShape !== 'default' && mergedShape !== 'square' && mergedShape`。`-dangerous` 类对位 antd `[${prefixCls}-dangerous]: danger`。本任务先不引用 icon-wrapper/loading（Task 4/5 加）。

- [ ] **Step 4: 跑测试确认绿**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/ooa-button.test.ts
```

预期：PASS。若 `danger+text` 或 `solid` 计算样式断言与预期不符，检查 `style/variant.ts` 的覆盖顺序（variant text 段必须覆盖 color 段设置的 text-color；solid 的 text-color 用 solid-text-color）。

- [ ] **Step 5: 提交**

```bash
git commit packages/components/src/components/button/ooa-button.ts packages/components/src/components/button/__tests__/ooa-button.test.ts -m "feat(button): ooa-button 主元素核心渲染（双轴模型 + 基础状态）"
```

---

## Task 4: icon-wrapper.ts + default-loading-icon.ts

**Files:**
- Create: `packages/components/src/components/button/icon-wrapper.ts`
- Create: `packages/components/src/components/button/default-loading-icon.ts`

- [ ] **Step 1: icon-wrapper.ts**

创建 `packages/components/src/components/button/icon-wrapper.ts`。对位 antd `IconWrapper.tsx`（渲染 `<span class="ant-btn-icon">` + slot）：

```ts
import { html, type TemplateResult } from 'lit';

/** 图标包装（对位 antd IconWrapper.tsx）：`.ooa-btn-icon` 包裹，供语义化 part 与间距控制。 */
export function iconWrapper(content: TemplateResult | typeof nothing, className = ''): TemplateResult {
  return html`<span class="ooa-btn-icon ${className}" part="icon">${content}</span>`;
}
```

- [ ] **Step 2: default-loading-icon.ts**

创建 `packages/components/src/components/button/default-loading-icon.ts`。对位 antd `DefaultLoadingIcon.tsx`。**loading 图标视觉对齐 antd `LoadingOutlined`**——从 `apps/parity/node_modules/@ant-design/icons/...` 找到 LoadingOutlined 的 SVG path 硬编码进来（`pnpm --filter @ooa/parity exec` 查找，或直接 WebFetch `@ant-design/icons-svg` 的 loading 定义），渲染为 inline SVG + `ooa-btn-spin` 动画：

```ts
import { html, type TemplateResult } from 'lit';

/**
 * 默认 loading 图标（对位 antd DefaultLoadingIcon.tsx）。
 * 复用 antd LoadingOutlined 的 SVG path，视觉 1:1；用 .ooa-btn-spin 动画旋转。
 */
export function defaultLoadingIcon(mount = false): TemplateResult {
  return html`
    <svg class=${mount ? '' : 'ooa-btn-spin'} viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true" part="loading-icon">
      <path d="${LOADING_PATH}"></path>
    </svg>`;
}

/** antd @ant-design/icons LoadingOutlined 的 path data（Step 2 从 node_modules 抄录）。 */
const LOADING_PATH = '/* TODO Task4 Step2: 从 @ant-design/icons LoadingOutlined 抄录 */';
```

> 注意：`mount` 对位 antd `isMountRef`——首帧不播动画。Task 5 在元素里传入 `!isMount`。

- [ ] **Step 3: 提交**

```bash
git commit packages/components/src/components/button/icon-wrapper.ts packages/components/src/components/button/default-loading-icon.ts -m "feat(button): 新增 icon-wrapper 与 default-loading-icon 模块"
```

---

## Task 5: ooa-button.ts 行为补齐（loading / icon / icon-only / icon-placement / 两汉字 / anchor）+ 测试

**Files:**
- Modify: `packages/components/src/components/button/ooa-button.ts`
- Modify: `packages/components/src/components/button/__tests__/ooa-button.test.ts`

- [ ] **Step 1: 追加失败测试**

在 `ooa-button.test.ts` 追加：

```ts
describe('loading', () => {
  it('loading 时 aria-busy + -loading 类 + loading icon 替换', async () => {
    const el = await renderButton({ loading: true }, '');
    const btn = getButton(el);
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.classList.contains('ooa-btn-loading')).toBe(true);
    expect(el.shadowRoot?.querySelector('.ooa-btn-icon svg')).not.toBeNull();
  });
  it('loading-delay 延迟生效（假定时器）', async () => {
    const el = await renderButton({ loading: true, 'loading-delay': 200 }, '');
    expect(getButton(el).classList.contains('ooa-btn-loading')).toBe(false);
    // 用 vi.useFakeTimers + advanceTimersByTime(200) 后断言为 true
  });
});

describe('icon / icon-only / icon-placement', () => {
  it('icon slot 存在时 + icon-only（无文字）', async () => {
    const el = await fixture<HTMLElement>(html`
      <ooa-button><span slot="icon">★</span></ooa-button>`);
    expect(getButton(el).classList.contains('ooa-btn-icon-only')).toBe(true);
    expect(el.shadowRoot?.querySelector('.ooa-btn-icon')).not.toBeNull();
  });
  it('icon-placement=end → -icon-end 类', async () => {
    const el = await renderButton({ 'icon-placement': 'end' }, '');
    expect(getButton(el).classList.contains('ooa-btn-icon-end')).toBe(true);
  });
});

describe('两汉字自动插空格', () => {
  it('单汉字文本命中 -two-chinese-chars', async () => {
    const el = await renderButton({}, '返回');
    expect(getButton(el).classList.contains('ooa-btn-two-chinese-chars')).toBe(true);
  });
  it('auto-insert-space=false 关闭', async () => {
    const el = await renderButton({ 'auto-insert-space': 'false' }, '返回');
    expect(getButton(el).classList.contains('ooa-btn-two-chinese-chars')).toBe(false);
  });
});

describe('anchor 分支', () => {
  it('href → <a>，disabled 移除 href + aria-disabled + tabindex', async () => {
    const el = await fixture<HTMLElement>(html`<ooa-button href="/x" target="_blank">Go</ooa-button>`);
    const a = el.shadowRoot?.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('/x');
    expect(a?.getAttribute('target')).toBe('_blank');

    const el2 = await fixture<HTMLElement>(html`<ooa-button href="/x" disabled>Go</ooa-button>`);
    const a2 = el2.shadowRoot?.querySelector('a');
    expect(a2?.hasAttribute('href')).toBe(false);
    expect(a2?.getAttribute('tabindex')).toBe('-1');
    expect(a2?.getAttribute('aria-disabled')).toBe('true');
  });
});
```

- [ ] **Step 2: 跑测试确认红**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/ooa-button.test.ts
```

预期：新增用例 FAIL。

- [ ] **Step 3: 补齐 ooa-button.ts 行为**

修改 `ooa-button.ts`：

1. **加载状态**（对位 antd loadingOrDelay + useLayoutEffect）：
   - `@state() private innerLoading = false;`
   - `private _delayTimer: ReturnType<typeof setTimeout> | null = null;`
   - `override willUpdate(changed: PropertyValues)`: 若 `loading`/`loadingDelay` 变化，`getLoadingConfig(this.loading, this.loadingDelay)`；`delay>0` 时清旧定时器并 `setTimeout(() => (this.innerLoading = true), delay)`，否则 `this.innerLoading = cfg.loading`。
   - `override disconnectedCallback()` 清定时器。
   - `private _isMount = true;` `override firstUpdated()` 置 false（对位 isMountRef），loading 图标 `mount={this._isMount}`。
   - loading 时 `aria-busy="true"`。
2. **icon 渲染**（对位 antd iconNode 三段逻辑）：
   - `@query('slot[name="icon"]')` / slotchange 跟踪 `_hasIcon`（`assignedElements().length > 0`）。
   - render：`innerLoading` 时显示 `<span class="ooa-btn-icon">` + `<slot name="loading-icon">${defaultLoadingIcon(this._isMount)}</slot>` 的兜底；否则若 `_hasIcon` 显示 `<span class="ooa-btn-icon"><slot name="icon"></slot></span>`。
   - icon-only：`!_hasDefaultContent && _hasIcon` → `-icon-only` 类（`_hasDefaultContent` 用默认 slot slotchange 或 `this.childNodes.length` 判断，排除 icon/loading-icon slot）。
   - `-icon-end` 类：`this.iconPlacement === 'end'`。
3. **两汉字**（对位 antd useEffect 运行时检测）：
   - `private _hasTwoCNChar = false;`
   - `override updated()`：读 `this.shadowRoot?.querySelector('button')?.textContent ?? ''`；`needInserted = 单默认内容 && !_hasIcon && !isUnBorderedVariant(variant)`；`should = needInserted && (this.autoInsertSpace ?? true) && isTwoCNChar(text)`；变化时更新 `_hasTwoCNChar` 并 `requestUpdate()`。
   - 类名追加 `_hasTwoCNChar ? 'ooa-btn-two-chinese-chars' : ''`。
4. **anchor 已实现**（Task 3），补充 loading 时点击 preventDefault 已覆盖（handleClick 里用 `this.innerLoading` 而非 `this.loading`）。
5. 类名追加 `-loading` / `-icon-only` / `-two-chinese-chars` / `-icon-end`。

- [ ] **Step 4: 跑测试确认绿**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/ooa-button.test.ts
```

预期：全部 PASS。注意 `loading-delay` 测试用 `vi.useFakeTimers()` 需在 `@open-wc/testing` fixture 与假定时器间协调（`await el.updateComplete` 后再 advance）。

- [ ] **Step 5: 提交**

```bash
git commit packages/components/src/components/button/ooa-button.ts packages/components/src/components/button/__tests__/ooa-button.test.ts -m "feat(button): ooa-button 补齐 loading/icon/两汉字/anchor 行为"
```

---

## Task 6: button-group.ts + style/group.ts + 测试

**Files:**
- Create: `packages/components/src/components/button/button-group.ts`
- Create: `packages/components/src/components/button/style/group.ts`
- Modify: `packages/components/src/components/button/style/index.ts`（启用 `buttonGroupStyles`）
- Modify: `packages/components/src/components/button/ooa-button.ts`（消费 `groupSizeContext`）
- Test: `packages/components/src/components/button/__tests__/ooa-button-group.test.ts`

- [ ] **Step 1: 写失败测试**

创建 `packages/components/src/components/button/__tests__/ooa-button-group.test.ts`：

```ts
import { html, fixture } from '@open-wc/testing';
import { expect } from 'vitest';
import '../ooa-button.js';
import '../button-group.js';

it('组内按钮继承 group size', async () => {
  const el = await fixture<HTMLElement>(html`
    <ooa-button-group size="small">
      <ooa-button>1</ooa-button>
      <ooa-button type="primary">2</ooa-button>
    </ooa-button-group>`);
  const btns = el.querySelectorAll('ooa-button');
  expect(btns[0].classList.contains('ooa-btn-sm')).toBe(true);
  expect(btns[1].classList.contains('ooa-btn-sm')).toBe(true);
});

it('渲染 .ooa-btn-group 容器', async () => {
  const el = await fixture<HTMLElement>(html`<ooa-button-group><ooa-button>1</ooa-button></ooa-button-group>`);
  expect(el.shadowRoot?.querySelector('.ooa-btn-group')).not.toBeNull();
});
```

- [ ] **Step 2: 跑测试确认红**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/ooa-button-group.test.ts
```

预期：FAIL（模块不存在）。

- [ ] **Step 3: 实现 button-group.ts**

创建 `packages/components/src/components/button/button-group.ts`。对位 antd `ButtonGroup.tsx`（渲染 `.ant-btn-group` + GroupSizeContext.Provider）：

```ts
import { createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { OoaSize } from '../../config/context.js';
import { buttonGroupStyles } from './style/group.js';

export const groupSizeContext = createContext<OoaSize | undefined>('ooa-button-group-size');

@customElement('ooa-button-group')
export class OoaButtonGroup extends LitElement {
  @property({ reflect: true }) size: OoaSize | undefined = undefined;

  @provide({ context: groupSizeContext })
  @property({ attribute: false })
  private groupSize: OoaSize | undefined = undefined;

  override willUpdate(changed: import('lit').PropertyValues<this>): void {
    if (changed.has('size')) this.groupSize = this.size;
  }

  static styles = buttonGroupStyles;

  override render() {
    return html`<span class="ooa-btn-group"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ooa-button-group': OoaButtonGroup; }
}
```

- [ ] **Step 4: 实现 style/group.ts 并接入元素**

创建 `packages/components/src/components/button/style/group.ts`。对位 antd `style/group.ts`（`.ant-btn-group` 相邻按钮边框合并、首尾圆角、hover z-index 抬升）：

```ts
import { css } from 'lit';

/** 组样式（对位 antd style/group.ts）：相邻按钮边框合并、首尾圆角、hover z-index。 */
export const buttonGroupStyles = css`
  .ooa-btn-group { display: inline-flex; }
  .ooa-btn-group ooa-button:not(:first-child) button { border-start-start-radius: 0; border-end-start-radius: 0; }
  .ooa-btn-group ooa-button:not(:last-child) button { border-start-end-radius: 0; border-end-end-radius: 0; }
  .ooa-btn-group ooa-button + ooa-button button { margin-inline-start: calc(-1 * var(--ooa-line-width, 1px)); }
  .ooa-btn-group ooa-button button:hover,
  .ooa-btn-group ooa-button button:active { z-index: 1; }
  .ooa-btn-group ooa-button:first-child button { border-color: var(--ooa-btn-group-border-color, var(--ooa-color-primary-hover, #4096ff)); }
`;
```

修改 `style/index.ts`：**补上 `import { buttonGroupStyles } from './group.js';`** 并把 `buttonGroupStyles` 加入 `buttonStyles` 数组（解除 Task 2 的注释）。修改 `ooa-button.ts`：

```ts
import { consume } from '@lit/context';
// 新增：
import { groupSizeContext } from './button-group.js';

// 替换原来的 groupSize 占位：
@consume({ context: groupSizeContext, subscribe: true })
@property({ attribute: false })
protected groupSize: OoaSize | undefined = undefined;
```

- [ ] **Step 5: 跑测试确认绿**

```bash
pnpm --filter @ooa/components test src/components/button/__tests__/ooa-button-group.test.ts
pnpm --filter @ooa/components test
```

预期：全部 PASS（含回归）。

- [ ] **Step 6: 提交**

```bash
git commit packages/components/src/components/button/button-group.ts packages/components/src/components/button/style/group.ts packages/components/src/components/button/style/index.ts packages/components/src/components/button/ooa-button.ts packages/components/src/components/button/__tests__/ooa-button-group.test.ts -m "feat(button): 新增 ooa-button-group 与组边框样式"
```

---

## Task 7: 入口导出更新 + 删除旧单文件 + 构建验证

**Files:**
- Modify: `packages/components/src/index.ts`
- Delete: `packages/components/src/components/ooa-button.ts`
- Modify: `apps/parity/src/cases/shared.tsx`（如必要，导出路径不变则跳过）

- [ ] **Step 1: 更新 index.ts**

修改 `packages/components/src/index.ts`，把 `./components/ooa-button.js` 替换为 `./components/button/ooa-button.js` 与 `./components/button/button-group.js`：

```ts
export * from './config/context.js';
export * from './config/ooa-config-provider.js';
export * from './components/button/ooa-button.js';
export * from './components/button/button-group.js';
export * from './components/ooa-input.js';
export * from './components/ooa-textarea.js';
export * from './components/ooa-password.js';
export * from './components/ooa-search.js';
export * from './components/ooa-otp.js';
```

- [ ] **Step 2: 删除旧文件**

```bash
git rm packages/components/src/components/ooa-button.ts
```

预期：文件从工作区移除。

- [ ] **Step 3: 构建验证**

```bash
pnpm --filter @ooa/components build
```

预期：tsc + vite build 通过（`dist/index.js` 生成）。若 tsc 报旧文件残留引用，检查是否有其他地方 import `components/ooa-button.js`。

- [ ] **Step 4: 提交**

```bash
git commit packages/components/src/index.ts packages/components/src/components/ooa-button.ts -m "refactor(button): 入口切换到模块目录并删除旧单文件"
```

> 若 pathspec 提交因该文件此前有暂存内容而失败，先 `git add packages/components/src/components/ooa-button.ts`（暂存删除）再 commit。

---

## Task 8: parity 矩阵扩充

**Files:**
- Modify: `apps/parity/src/cases/button.tsx`

- [ ] **Step 1: 扩充 button case**

修改 `apps/parity/src/cases/button.tsx`，把两列渲染扩为矩阵。两侧共用同一份配置数组，`OoaButton` helper（`shared.tsx`）与 `<AntButton>` 各自消费。覆盖：

- variant × color：全部 6 variant × {default, primary, danger, red, blue}（预设色取代表性 2-3 个避免行爆炸，其余预设色在 storybook 覆盖）。
- 组合：`danger+primary`、`danger+text`、`danger+link`、`danger+dashed`、`danger+filled`。
- ghost：`primary ghost`、`red solid ghost`、`text ghost`。
- shape：default / circle / round / square。
- states：loading、loading-delay、disabled、icon（带 icon 与 icon-only）、icon-placement=end、anchor（href）。
- group：`<AntButton.Group>` 与 `<ooa-button-group>` 各一组。

每格用一个 `<DemoBlock>`。数组驱动，避免手写重复：

```tsx
const VARIANTS = ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'] as const;
const COLORS = ['default', 'primary', 'danger', 'red', 'blue'] as const;

function VariantMatrix({ surface }: { surface: SurfaceName }) {
  const rows = VARIANTS.map((variant) => (
    <div className="demo-row" key={variant}>
      {COLORS.map((color) =>
        surface === 'ooa'
          ? OoaButton({ variant, color }, `${variant}/${color}`)
          : <AntButton variant={variant} color={color}>{variant}/{color}</AntButton>
      )}
    </div>
  ));
  return <div className="demo-stack">{rows}</div>;
}
```

> 注意：`shared.tsx` 的 `OoaButton(props, children)` 已是 `createElement('ooa-button', props, children)`，字符串属性直接透传；`variant`/`color` 不需要改 helper。若渲染 icon-only 需传 `children` 为 `undefined` 并塞 `<span slot="icon">`——用 `createElement` 组合。

- [ ] **Step 2: 类型检查 + 启动验证**

```bash
pnpm --filter @ooa/parity build
```

预期：tsc --noEmit + vite build 通过。手动启动 `pnpm parity`，肉眼核对 antd 与 ooa 两列每个矩阵格视觉一致（尤其 ghost / danger+text / filled 预设色 / solid-text-color）。

- [ ] **Step 3: 提交**

```bash
git commit apps/parity/src/cases/button.tsx -m "test(parity): 扩充 button 矩阵到 variant×color×state×group"
```

---

## Task 9: storybook 更新

**Files:**
- Modify: `apps/storybook/stories/button.stories.ts`

- [ ] **Step 1: 更新 args**

修改 `apps/storybook/stories/button.stories.ts`，args/argTypes 增加 `variant`（outlined/dashed/solid/filled/text/link）、`color`（default/primary/danger + 预设色）、`shape`（default/circle/round/square）；render 模板同步绑定：

```ts
args: { type: 'default', variant: 'outlined', color: 'default', danger: false, disabled: false, loading: false },
argTypes: {
  type: { control: 'select', options: ['default', 'primary', 'dashed', 'link', 'text'] },
  variant: { control: 'select', options: ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'] },
  color: { control: 'select', options: ['default', 'primary', 'danger', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple', 'magenta'] },
  shape: { control: 'select', options: ['default', 'circle', 'round', 'square'] },
},
render: (args) => html`<ooa-button type=${args.type} variant=${args.variant} color=${args.color} ?danger=${args.danger} ?disabled=${args.disabled} ?loading=${args.loading}>Button</ooa-button>`,
```

新增预设色 story 与 ghost story 各一个。保留 `ConfigProviderSize` 示例。

- [ ] **Step 2: 类型检查**

```bash
pnpm --filter @ooa/storybook build   # 或 pnpm storybook 启动验证
```

预期：构建/启动无错误，按钮渲染含新 controls。

- [ ] **Step 3: 提交**

```bash
git commit apps/storybook/stories/button.stories.ts -m "docs(storybook): button 增加 variant/color/shape controls"
```

---

## 完成定义（Definition of Done）

- [ ] `packages/components/src/components/button/` 下 9 个模块齐备，`style/index.ts` 组合全部样式。
- [ ] `pnpm --filter @ooa/components test` 全绿（helpers / ooa-button / button-group）。
- [ ] `pnpm --filter @ooa/components build` 通过，`dist` 生成。
- [ ] `pnpm --filter @ooa/parity build` 通过；parity 两列视觉核对通过（ghost / danger+text / filled 预设色 / solid-text-color）。
- [ ] storybook button 支持 variant/color/shape controls。
- [ ] 旧 `src/components/ooa-button.ts` 已删除，无残留引用。
