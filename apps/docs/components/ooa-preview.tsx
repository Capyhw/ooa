'use client';

import '@ooa/components';
import '@ooa/tokens/theme.css';

export function OoaPreview() {
  return (
    <ooa-config-provider component-size="middle">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <ooa-button>Default</ooa-button>
        <ooa-button type="primary">Primary</ooa-button>
        <ooa-input placeholder="Web Component input" allow-clear />
      </div>
    </ooa-config-provider>
  );
}
