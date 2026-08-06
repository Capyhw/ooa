import { css } from 'lit';

export const baseControlStyles = css`
  :host {
    color: var(--ooa-color-text, rgba(0, 0, 0, 0.88));
    font-family: var(--ooa-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    font-size: 14px;
    line-height: 1.5715;
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
