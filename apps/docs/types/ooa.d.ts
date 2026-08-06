import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ooa-config-provider': Record<string, unknown>;
      'ooa-button': Record<string, unknown>;
      'ooa-input': Record<string, unknown>;
    }
  }
}
