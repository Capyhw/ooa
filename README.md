# OOA

OOA is a framework-agnostic Web Components library built with Lit. Its initial
compatibility target is `ant-design@6.5.3`, with static styles and CSS custom
properties following Ant Design 6 zero-runtime direction.

## Packages

- `@ooa/components`: custom elements such as `ooa-button` and the Input family.
- `@ooa/tokens`: theme token definitions and CSS variables.

## Contract

The public runtime API is native DOM. Components emit composed, bubbling
`ooa-change` events. Theme variables are inherited through Shadow DOM, while
locale, direction, size, and disabled state are supplied by
`<ooa-config-provider>` through `@lit/context`.

## Test Strategy

- Pure token algorithms run in Vitest's Node environment.
- Components run in Vitest Browser Mode with the Playwright provider.
- Visual regression is a required CI stage and compares pinned Chromium
  screenshots against fixed `ant-design@6.5.3` reference fixtures.
