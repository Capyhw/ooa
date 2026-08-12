# Repository Guidelines

## 原则
1.在得到我开始修改代码的指令前不要动代码
2.编写代码时添加必要的注释
3.此原则仅适用于涉及 ant-design 相关 ：在编写或探索antd的任何代码之前，请先阅读 https://ant.design/docs/react/for-agents-cn.md 和 https://raw.githubusercontent.com/ant-design/ant-design-cli/main/skills/antd/SKILL.md，留意弃用提示，并按照说明使用 Ant Design。
4.不要为了兼容而写过多的防御代码，允许破坏性更新，但是需要用户同意
5.不做视觉分析，但是可以用浏览器审查dom
6.修复问题要从根源出发先定位原因，避免一个原因导致的多个地方类似bug，只修复表层，其他地方仍然有问题

## 项目结构与模块组织

这是一个使用 pnpm 和 Turbo 管理的 Lit Web Components monorepo，目标是提供与框架无关、受 Ant Design v6 启发的组件（主要所有参考antd的代码实现都要用v6版本的）。生产包位于 `packages/`：`components/src/` 存放自定义元素、配置、公共样式和 `index.ts` 入口；`tokens/src/` 存放设计令牌 API 与 `theme.css`。`dist/` 是构建产物，不要直接编辑。应用位于 `apps/`：`apps/docs/` 是 Next.js/Fumadocs 文档站，`apps/storybook/stories/` 存放组件示例。

## 组件复刻流程

复刻 antd 组件（`packages/components` 实现 + `apps/parity` 对比 + storybook 验收）按 [docs/component-replication.md](./docs/component-replication.md) 执行。要点：antd 源码对照 GitHub `components/<组件>/`（https://github.com/ant-design/ant-design/tree/master/components/<组件>/，camelCase 文件 ↔ OOA kebab-case），文档 md 在同目录 `index.zh-CN.md`；组件文档也可用 antd skill 查 `antd doc <组件> --lang zh`；antd 已废弃 API 的 demo 不做；parity case 照搬官网 demo 结构，一个官网 demo 一个 DemoBlock。

## 构建与开发命令

根目录清单声明使用 pnpm 9。

- `pnpm dev` 启动组件 Vite 沙盒，通常访问 `http://localhost:5173`，支持热更新。
- `pnpm docs` 先构建包依赖，再在 7855 端口启动文档站。
- `pnpm storybook` 在 7856 端口启动 Storybook。
- `pnpm build` 通过 Turbo 执行所有构建任务，生成包、文档和 Storybook 产物。
- `pnpm --filter docs lint` 使用 Biome 检查文档应用。

## 代码风格与命名约定

TypeScript 使用 ES Module 和 2 空格缩进。保持严格类型检查通过；未使用的局部变量和参数会导致组件编译失败。自定义元素的文件名和标签名使用 `ooa-` 前缀，例如 `ooa-button.ts` 和 `<ooa-button>`。公共 API 从对应包的 `src/index.ts` 导出；共享设计值应放在 `@ooa/tokens`，不要在组件中重复定义。文档应用使用 Biome 的推荐、React 和 Next.js 规则；修改文档代码后运行 `pnpm --filter docs format`。

## 提交与 Pull Request 规范

当前分支没有提交历史，暂无既有格式可遵循。提交信息建议使用简洁的 Conventional Commits，例如 `feat(button): add loading state` 或 `fix(tokens): correct focus color`，并保持每次提交职责单一。PR 应说明用户可见的变化、列出执行过的校验命令、关联相关 issue（如有）。不要提交 `dist/`、`.next/`、`storybook-static/`、覆盖率目录或本地浏览器产物。
