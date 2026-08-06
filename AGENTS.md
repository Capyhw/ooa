# Repository Guidelines

## 项目结构与模块组织

这是一个使用 pnpm 和 Turbo 管理的 Lit Web Components monorepo，目标是提供与框架无关、受 Ant Design 启发的组件。生产包位于 `packages/`：`components/src/` 存放自定义元素、配置、公共样式和 `index.ts` 入口；`tokens/src/` 存放设计令牌 API 与 `theme.css`。`dist/` 是构建产物，不要直接编辑。应用位于 `apps/`：`apps/docs/` 是 Next.js/Fumadocs 文档站，`apps/storybook/stories/` 存放组件示例。

## 构建、测试与开发命令

根目录清单声明使用 pnpm 9。

- `pnpm dev` 启动组件 Vite 沙盒，通常访问 `http://localhost:5173`，支持热更新。
- `pnpm docs` 先构建包依赖，再在 7855 端口启动文档站。
- `pnpm storybook` 在 7856 端口启动 Storybook。
- `pnpm build` 通过 Turbo 执行所有构建任务，生成包、文档和 Storybook 产物。
- `pnpm test` 运行各包的单元测试；`pnpm test:browser` 使用 Playwright/Chromium 运行浏览器测试。
- `pnpm --filter docs lint` 使用 Biome 检查文档应用。

## 代码风格与命名约定

TypeScript 使用 ES Module 和 2 空格缩进。保持严格类型检查通过；未使用的局部变量和参数会导致组件编译失败。自定义元素的文件名和标签名使用 `ooa-` 前缀，例如 `ooa-button.ts` 和 `<ooa-button>`。公共 API 从对应包的 `src/index.ts` 导出；共享设计值应放在 `@ooa/tokens`，不要在组件中重复定义。文档应用使用 Biome 的推荐、React 和 Next.js 规则；修改文档代码后运行 `pnpm --filter docs format`。

## 测试规范

Node 单元测试与源码放在一起，命名为 `*.test.ts`；浏览器组件测试命名为 `*.browser.test.ts`。组件测试配置位于 `packages/components/vitest.workspace.ts`，令牌测试直接使用 Vitest。修改组件时，应覆盖公共行为、事件和无障碍相关交互；如果视觉状态或输入参数变化，同时更新或新增对应的 `*.stories.ts` Story。

## 提交与 Pull Request 规范

当前分支没有提交历史，暂无既有格式可遵循。提交信息建议使用简洁的 Conventional Commits，例如 `feat(button): add loading state` 或 `fix(tokens): correct focus color`，并保持每次提交职责单一。PR 应说明用户可见的变化、列出执行过的校验命令、关联相关 issue（如有），视觉改动需附截图或 Storybook 证据。不要提交 `dist/`、`.next/`、`storybook-static/`、覆盖率目录或本地浏览器产物。
