# 组件复刻规范流程

把 antd v6 组件以 1:1 视觉 / 行为对齐复刻为 OOA（Lit Web Components）的完整流程。
以 `button` 为首个完整样例沉淀，后续每个新组件（input / textarea / password / search / otp …）照此执行。

- 目标：OOA 组件与 antd 在相同输入下渲染出相同 DOM 结构、相同样式、相同行为；parity 应用并排肉眼/审查核对 1:1。
- 适用范围：`packages/components`（实现）、`apps/parity`（对比）、`apps/storybook`（验收）、`packages/tokens`（token）。
- 前置原则见 [AGENTS.md](../AGENTS.md)：只参考 antd v6；探索/编写 antd 前先读相关 skill；不做视觉分析（可用浏览器审查 DOM）；不写防御代码，破坏性更新需用户同意；修复从根源出发。
- **复刻流程次序**：① 读组件源码（本地 antd 仓库，见 §1.1）理解实现 → ② 读示例页 md（`index.zh-CN.md`，见 §1.2）作为 parity case 参考编写示例 → ③ 在 parity 页面（本地 antd vs OOA）审查 DOM / 计算样式核对 1:1（见 Phase 9）。对比只发生在 parity 页面，不用 antd 官网示例页。

---

## 1. 关键资源定位

复刻过程只有两处外部信息源，其余全部对位 OOA 自己沉淀的资产。

### 1.1 antd 源码路径 —— 复刻实现时对照

**以本地仓库 `/Users/weiyuhang/code/myCode/ant-design` 为唯一实现依据**，复刻前先 `git pull` 同步到最新（master 分支即 v6 最新源码；需要精确对齐版本时 checkout 对应 tag，如 `6.5.0`），源码在 `components/<组件>/` 目录：

```
/Users/weiyuhang/code/myCode/ant-design/components/<组件>/
```

目录内为 TypeScript 源码（`.tsx` / `.ts`），文件名 camelCase；OOA 侧统一 **kebab-case 平铺**，对照时按下表映射。本地若装有 antd，`apps/parity/node_modules/antd/es/<组件>/` 是同一结构的编译产物（`.js`），仅用于快速核对编译后产物确认 DOM / 类名 / token 取值，内容以本地仓库源码为准（编译产物可能丢失类型与注释信息）。

以 button 为例（文件级对位表，新组件套用同一规律）：

| antd 源码（components/button/…） | OOA（components/button/…） | 对位职责 |
|---|---|---|
| `Button.tsx` | `ooa-button.ts` | 主元素（属性、渲染、行为） |
| `ButtonGroup.tsx` | `button-group.ts` | 组容器 |
| `buttonHelpers.tsx` | `button-helpers.ts` | 纯逻辑（解析 / 合并 / 归一化 / 状态推导） |
| `IconWrapper.tsx` | `icon-wrapper.ts` | icon 包装 |
| `DefaultLoadingIcon.tsx` | `default-loading-icon.ts` | 默认 loading 图标 |
| `style/index.ts`（`genStyleHooks`） | `style/index.ts` | 样式组合导出 |
| `style/token.ts`（`prepareComponentToken`） | `style/token.ts` | 组件 token：全局 `--ooa-*` → 组件 `--ooa-comp-*` 变量 |
| `style/variant.ts` | `style/variant.ts` | 变体样式 |
| `style/group.ts` | `style/group.ts` | 组边框合并 |
| `style/compact.ts` | `style/shape-size.ts`（部分） | 尺寸 / 紧凑 |

组件内部若有 `hooks/`、`utils.ts`、`style/*.ts` 之外的工具，照 `buttonHelpers.tsx → button-helpers.ts` 的规律归入 `<component>-helpers.ts` 或对应 `utils` 文件。

> 全局 token 不需要手查：`packages/tokens/src/theme.css` 由 `apps/parity/scripts/sync-antd-tokens.mjs` 从 antd `getDesignToken()` 生成，`--ooa-*` 与 antd `--ant-*` 一一对应（`:root` 亮色 + `ooa-config-provider[theme="dark"]` 暗色），修改需重新跑脚本，不手改。

### 1.2 antd 文档页 md —— 编写 parity case 时对照

parity case 按 antd 官网 demo 结构照搬（每个官网 demo 一个 DemoBlock，标题沿用官网中文名）。antd 文档 markdown 与源码同目录，就在本地仓库组件目录的 `index.zh-CN.md`：

```
/Users/weiyuhang/code/myCode/ant-design/components/<组件>/index.zh-CN.md
```

（button 即 `/Users/weiyuhang/code/myCode/ant-design/components/button/index.zh-CN.md`，标题同为官网中文名。）本地快速获取用 antd skill（`@ant-design/cli`）：

```bash
which antd || npm install -g @ant-design/cli   # 未安装时装一次
antd doc Button --lang zh                       # 完整 markdown 文档（中文）
antd info Button --version 6.5.0 --format json  # API：props / 弃用标注
antd token Button --version 6.5.0 --format json # 组件级 design token
antd demo Button basic --format json            # 官方 demo 源码
```

- 版本参数与 `apps/parity/package.json` 的 `antd` 版本保持一致（当前 `6.5.0`）。
- 用 `--format json` 做程序化解析。
- 文档 `代码演示` 一节的 `<code src="./demo/xxx.tsx">标题</code>` 即官网 demo 清单（标题为官网中文名）；**`debug` 标记的 demo 是调试用例，不做 parity**（例：`legacy-group.tsx`「废弃的 Block 组」）。
- 留意 `antd info` 输出的 deprecated 标注：**已废弃 API 的 demo 一律不做**（例：antd 废弃的 `Button.Group`，parity 中不建 legacy group case）。

---

## 2. 复刻阶段

每个阶段产出可独立提交；校验命令逐阶段列出。

### Phase 0 —— 前置与 API 摸底（不写代码）

1. 确认 antd 版本：`apps/parity/package.json` → `antd`（当前 `6.5.0`）。
2. 按 AGENTS.md 先读 antd 相关 skill（`@ant-design/cli`）。
3. 用 1.2 的命令摸清目标组件 API 面：props 全集、deprecated 标注、组件 token、官方 demo 清单。
4. 判断全局 token 覆盖度：目标组件的视觉是否只依赖 theme.css 已有变量；不够才进 Phase 3 加组件 token。

产物：API 清单（props / slots / 事件 / 状态 / 废弃项）。
校验：`antd info <组件> --version 6.5.0 --format json` 输出完整、无歧义。

### Phase 1 —— 组件模块骨架

在 `packages/components/src/components/<组件>/` 建目录，按 1.1 的表建空模块；`packages/components/src/index.ts` 加导出。

```
components/<组件>/
├── ooa-<组件>.ts          # 主元素
├── <组件>-helpers.ts      # 纯逻辑（对位 antd 同名 helpers/utils）
├── style/
│   ├── index.ts           # 组合导出（styles.ts 的 baseControlStyles + 本组件全部样式）
│   ├── token.ts           # 组件 token 变量
│   ├── variant.ts         # 变体样式
│   └── …                  # 按需（shape-size / group / …）
└── __tests__/
    ├── <组件>-helpers.test.ts
    └── ooa-<组件>.test.ts
```

### Phase 2 —— 纯逻辑先行（helpers + 单测）

把"解析 / 合并 / 归一化 / 状态推导"这类**与 DOM 无关**的逻辑抽成纯函数模块并先行测试。对位 antd 源码中的同职责函数（`buttonHelpers.js` → `resolveColorVariant` / `getLoadingConfig` / `isTwoCNChar` 等）。

- 单测用 Vitest（见 §4），不依赖 DOM 即可覆盖推导规则。
- 这一步做扎实，主元素实现时几乎只剩渲染与事件接线。

### Phase 3 —— style 模块

- `token.ts`：对位 antd `prepareComponentToken`，把全局 `--ooa-*` token 收敛为组件 `--ooa-comp-*` 变量；**每个引用都带 fallback 默认值**（`var(--ooa-x, <字面量>)`）。
- `variant.ts` / `shape-size.ts` / …：对位 antd `genStyleHooks` 内的样式函数（`genVariantStyle` / `genSharedButtonStyle` …）。
- 设计值一律引用全局 token 变量，**不在组件内重复定义**；antd 是 JS 侧计算的（如 button 的 solid 文字色 `isBright`）在组件里用 JS 算好内联 CSS 变量兜底。

### Phase 4 —— 主元素实现（`ooa-<组件>.ts`）

- 属性：`@property({ reflect: true })`，kebab-case 属性名对齐 antd props（`icon-placement`、`auto-insert-space`）。
- 全局配置：`@consume({ context: ooaConfigContext })` 接 `component-size` / `disabled` / theme / direction，不进组件 props。
- 行为状态机对位 antd（button：`innerLoading` + `loading-delay`、两汉字自动插空格、anchor 分支）。
- **DOM 结构对齐 antd**：内部 button / a 标签、类名（`.ooa-btn`）、slot 命名，保证 parity 断言与后续审查一致。
- 每个行为对齐一次提交（见 §6）。

### Phase 5 —— 扩展复合件

组容器（`button-group`）、icon 封装（`icon-wrapper`）、默认图标（`default-loading-icon`）等主元素之外的文件按 antd 对应文件逐个补齐。

### Phase 6 —— parity case（`apps/parity/src/cases/<组件>.tsx`）

见 §3 的 case 编写规范。同时 `shared.tsx` 增加 `OoaXxx` React 包装（把自定义元素渲染 + `ooa-*` 事件桥接成 React 回调），并在 `cases/index.ts` 注册 `PARITY_CASES`。

### Phase 7 —— 组件测试

Vitest v4 browser mode（chromium）。覆盖：helpers 纯逻辑单测 + 组件渲染 DOM 断言（对齐 antd DOM 类名）+ 行为（事件、loading 时序）。

### Phase 8 —— storybook

`apps/storybook/stories/<组件>.stories.ts`：`argTypes` 覆盖全部属性做 controls，另配状态 story（danger / ghost / loading / disabled / 双轴）。

### Phase 9 —— 验收

1. `pnpm dev` 打开 parity，肉眼并排核对 light / dark / LTR / RTL / size / disabled 各轴。
2. `pnpm build` 全绿（组件包 + docs + storybook）。
3. 有疑问时**在 parity 页面用浏览器审查 DOM**（不是视觉分析），对比 **OOA 侧与本地 antd 侧**的真实 DOM 结构与计算样式。**不要在 antd 官网示例页做对比**：官网跑最新版本，可能与锁定的 antd 不一致，对比基准一律以 parity 页面的本地 antd（`apps/parity` 的 `antd` 依赖版本）为准。

### Phase 10 —— 提交

按 §6 的提交规范，职责单一、可回放。

---

## 3. parity case 编写规范

对应 `apps/parity/src/cases/*.tsx`，以 `button.tsx` 为完整样例。

1. **照搬官网 demo 结构**：一个官网 demo 一个 `DemoBlock`，标题沿用官网中文名，按钮集合、顺序与 props 照搬。
2. **属性差异映射**：ooa 走 kebab-case 属性，antd 走 camelCase prop，用小型 helper 收敛差异：
   ```tsx
   const placementProp = (surface: SurfaceName, value: 'start' | 'end') =>
     surface === 'ooa' ? { 'icon-placement': value } : { iconPlacement: value };
   ```
3. **全局配置正交**：`size` / `disabled` / `theme` / `direction` 由外层 antd `ConfigProvider` 与 `ooa-config-provider` 全局下发，case 里只传组件级语义（type / color / variant / shape / loading …）。受控值（input 的 value）经 `CaseContext` 传递。
4. **省略依赖 OOA 没有的辅助组件的 demo**：Tooltip / Radio.Group / Divider / Dropdown / Space.Compact / Flex / antd-style 一律省略或等价占位，只保留按钮/输入本身做 1:1 对比。交互型 demo（Radio 切换、点击 loading）改为静态多行展示。
5. **废弃 demo 不做**：antd 已废弃 API（如 `Button.Group`）不建 case。
6. **可复现**：状态全部进 URL query（`?case=&theme=&size=…`），便于分享与回归。

---

## 4. 测试规范（Vitest v4 browser）

- 配置文件 `packages/components/vitest.config.ts`：browser provider 用 `@vitest/browser-playwright` factory 形式（Vitest v4 中字符串 `'playwright'` 已废弃）。
- 自定义 `fixture()`（`src/testing/fixture.ts`）：渲染进 `document.body` + 等 `updateComplete` + `requestAnimationFrame`。**不要引入 `@open-wc/testing`**（内部 import web-dev-server socket，与 Vitest browser mode 不兼容）。
- 属性设置：lit 3 不支持 `<tag ${attrString}>` 字符串属性展开，用命令式 `createElement` + `setAttribute`（boolean 属性存在即 true），参考 `renderButton()` 的写法。
- 断言目标：内部 DOM 的 class 与结构对齐 antd（如 `.ooa-btn.ooa-btn-sm`），行为时序（loading-delay、事件）。

---

## 5. token 分层规范

```
全局 token（theme.css，--ooa-*）            ← sync-antd-tokens.mjs 从 antd getDesignToken() 生成
   └─ 组件 token（style/token.ts，--ooa-comp-*）  ← 对位 antd prepareComponentToken，带 fallback
        └─ 组件样式（variant / shape-size / …）     ← 对位 antd genStyleHooks 样式函数
```

- 组件 token 只在必要时新增，优先复用全局变量。
- 组件内 CSS 一律经 CSS 变量表达，值可被主题覆盖，不在组件 JS 里写死视觉值（antd 在 JS 侧计算的除外，见 Phase 3）。

---

## 6. 提交规范

- Conventional Commits，scope 用组件名：`feat(button): …` / `fix(tokens): …` / `docs(storybook): …` / `test(parity): …`。
- 每次提交职责单一：一个行为 / 一个修复 / 一个模块。
- 不提交 `dist/`、`.next/`、`storybook-static/`、覆盖率目录、浏览器产物。

---

## 7. 新组件复刻 checklist

- [ ] Phase 0：`antd info <组件> --version 6.5.0` 摸清 API，记录废弃项
- [ ] 确认全局 token 覆盖，必要时补组件 token
- [ ] Phase 2：helpers 纯逻辑 + 单测先行（红→绿）
- [ ] Phase 3：style 模块（token / variant / …），全部引用全局变量 + fallback
- [ ] Phase 4：主元素实现，DOM 对齐 antd，行为逐个提交
- [ ] Phase 5：扩展复合件（group / icon / 默认图标）
- [ ] Phase 6：parity case 照搬官网 demo 结构 + 注册 PARITY_CASES
- [ ] Phase 7：Vitest browser 测试通过
- [ ] Phase 8：storybook controls 覆盖全部属性
- [ ] Phase 9：parity 各轴肉眼核对 + `pnpm build` 全绿
