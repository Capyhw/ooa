import { ConfigProvider, theme as antdTheme } from 'antd';
import { createElement, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_CASE_ID,
  PARITY_CASES,
  type CaseContext,
  type ComponentSize,
  type Direction,
  type ParityCase,
  type SurfaceName,
  type ThemeName,
} from './cases';

interface GlobalConfig {
  theme: ThemeName;
  direction: Direction;
  size: ComponentSize;
  disabled: boolean;
}

interface AppState {
  caseId: string;
  config: GlobalConfig;
}

const DEFAULT_VALUE = 'Parity check';

function getCase(caseId: string): ParityCase {
  return PARITY_CASES.find((item) => item.id === caseId) ?? PARITY_CASES[0];
}

function readState(): AppState {
  const params = new URLSearchParams(window.location.search);
  const requestedCase = params.get('case') ?? DEFAULT_CASE_ID;
  const theme = params.get('theme');
  const direction = params.get('direction');
  const size = params.get('size');

  return {
    caseId: getCase(requestedCase).id,
    config: {
      theme: theme === 'dark' ? 'dark' : 'light',
      direction: direction === 'rtl' ? 'rtl' : 'ltr',
      size: size === 'small' || size === 'large' ? size : 'middle',
      disabled: params.get('disabled') === 'true',
    },
  };
}

function updateUrl(state: AppState) {
  const params = new URLSearchParams({
    case: state.caseId,
    theme: state.config.theme,
    direction: state.config.direction,
    size: state.config.size,
  });

  if (state.config.disabled) params.set('disabled', 'true');

  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
}

function Toggle({ checked, label, onChange, testId }: { checked: boolean; label: string; onChange: (value: boolean) => void; testId: string }) {
  return (
    <label className="toggle-control" data-testid={testId}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle-mark" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange, label, testId }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; label: string; testId: string }) {
  return (
    <div className="toolbar-control">
      <span className="toolbar-label">{label}</span>
      <div className="segmented" role="group" aria-label={label} data-testid={testId}>
        {options.map((option) => (
          <button
            className={option.value === value ? 'segment is-active' : 'segment'}
            type="button"
            key={option.value}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            data-testid={`${testId}-${option.value}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * 把同一份全局配置同时应用到 OOA 侧：ooa-config-provider 通过 Lit context
 * 把 componentSize / disabled 下发到组件，theme 通过 theme.css 的
 * `ooa-config-provider[theme="dark"]` 选择器换肤，direction 由 host 的 dir 生效。
 * 使用 createElement 以避开 React 对自定义元素 JSX 的类型推断。
 */
function OoaProvider({ config, children }: { config: GlobalConfig; children: ReactNode }) {
  return createElement(
    'ooa-config-provider',
    {
      theme: config.theme,
      direction: config.direction,
      'component-size': config.size,
      disabled: config.disabled,
    },
    children,
  );
}

function Surface({ name, parityCase, context, config }: { name: SurfaceName; parityCase: ParityCase; context: CaseContext; config: GlobalConfig }) {
  const content = parityCase.render(name, context);

  if (name === 'antd') {
    return (
      <ConfigProvider
        componentSize={config.size}
        componentDisabled={config.disabled}
        direction={config.direction}
        theme={{ algorithm: config.theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}
      >
        <section className="surface" data-testid="parity-surface-antd" data-surface="antd" data-theme={config.theme}>
          <header className="surface-header">
            <div>
              <span className="surface-kicker">BASELINE</span>
              <h2>Ant Design</h2>
            </div>
            <span className="surface-version">v6.5.0 / React</span>
          </header>
          <div className="surface-canvas">{content}</div>
        </section>
      </ConfigProvider>
    );
  }

  return (
    <OoaProvider config={config}>
      <section className="surface" data-testid="parity-surface-ooa" data-surface="ooa" data-theme={config.theme}>
        <header className="surface-header">
          <div>
            <span className="surface-kicker">IMPLEMENTATION</span>
            <h2>OOA Components</h2>
          </div>
          <span className="surface-version">Lit / Web Components</span>
        </header>
        <div className="surface-canvas">{content}</div>
      </section>
    </OoaProvider>
  );
}

export function App() {
  const [state, setState] = useState<AppState>(readState);
  const [value, setValue] = useState(DEFAULT_VALUE);
  const parityCase = useMemo(() => getCase(state.caseId), [state.caseId]);

  useEffect(() => {
    updateUrl(state);
  }, [state]);

  useEffect(() => {
    const handlePopState = () => setState(readState());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateConfig = useCallback(<K extends keyof GlobalConfig>(key: K, nextValue: GlobalConfig[K]) => {
    setState((current) => ({ ...current, config: { ...current.config, [key]: nextValue } }));
  }, []);

  const selectCase = (caseId: string) => {
    setState((current) => ({ ...current, caseId }));
    setValue(DEFAULT_VALUE);
  };

  const context = useMemo(
    () => ({ value, onValueChange: setValue }),
    [value],
  );

  return (
    <div className="parity-app" data-testid="parity-app">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">OOA</div>
          <div>
            <div className="brand-name">Parity Lab</div>
            <div className="brand-caption">component verification</div>
          </div>
        </div>

        <div className="sidebar-rule" />
        <div className="sidebar-heading">CASES <span>{String(PARITY_CASES.length).padStart(2, '0')}</span></div>
        <nav className="case-nav" aria-label="Parity cases">
          {PARITY_CASES.map((item) => (
            <button
              className={item.id === parityCase.id ? 'case-link is-active' : 'case-link'}
              type="button"
              key={item.id}
              onClick={() => selectCase(item.id)}
              data-testid={`case-${item.id}`}
              aria-current={item.id === parityCase.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>local baseline</span>
          <code>antd@6.5.0</code>
        </div>
      </aside>

      <main className="workspace">
        <section className="toolbar" aria-label="Global configuration" data-testid="parity-toolbar">
          <span className="toolbar-title">ConfigProvider</span>
          <SegmentedControl
            label="Theme"
            value={state.config.theme}
            onChange={(value) => updateConfig('theme', value)}
            options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            testId="theme-control"
          />
          <SegmentedControl
            label="Direction"
            value={state.config.direction}
            onChange={(value) => updateConfig('direction', value)}
            options={[{ value: 'ltr', label: 'LTR' }, { value: 'rtl', label: 'RTL' }]}
            testId="direction-control"
          />
          <SegmentedControl
            label="Size"
            value={state.config.size}
            onChange={(value) => updateConfig('size', value)}
            options={[{ value: 'small', label: 'Small' }, { value: 'middle', label: 'Middle' }, { value: 'large', label: 'Large' }]}
            testId="size-control"
          />
          <Toggle label="Disabled" checked={state.config.disabled} onChange={(value) => updateConfig('disabled', value)} testId="disabled-toggle" />
        </section>

        <div className="compare-grid" data-testid="comparison-grid">
          <Surface name="ooa" parityCase={parityCase} context={context} config={state.config} />
          <Surface name="antd" parityCase={parityCase} context={context} config={state.config} />
        </div>
      </main>
    </div>
  );
}
