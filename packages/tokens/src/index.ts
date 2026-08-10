/**
 * Design tokens for OOA Web Components.
 *
 * Token VALUES live in the generated `theme.css` (written by
 * apps/parity/scripts/sync-antd-tokens.mjs): the light palette on `:root`, the
 * dark palette scoped to `<ooa-config-provider theme="dark">`. This module only
 * exposes the theme-name union consumed by the config-provider.
 */
export type OoaThemeName = 'light' | 'dark';
