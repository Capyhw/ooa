import '@ooa/tokens/theme.css';
import { html, render } from 'lit';
import './index.js';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) render(html`
  <main>
    <header>
      <span>OOA / 0.1</span>
      <h1>Web-native components.</h1>
      <p>Ant Design 6 inspired controls implemented with Lit.</p>
    </header>
    <ooa-config-provider component-size="middle">
      <section>
        <h2>Button</h2>
        <div class="row">
          <ooa-button>Default</ooa-button><ooa-button type="primary">Primary</ooa-button>
          <ooa-button type="dashed">Dashed</ooa-button><ooa-button type="text">Text</ooa-button>
          <ooa-button danger>Danger</ooa-button><ooa-button loading>Loading</ooa-button>
        </div>
      </section>
      <section>
        <h2>Input family</h2>
        <div class="stack">
          <ooa-input placeholder="Input with clear" allow-clear show-count max-length="50"></ooa-input>
          <ooa-password placeholder="Password"></ooa-password>
          <ooa-search placeholder="Search documentation"></ooa-search>
          <ooa-textarea placeholder="Textarea" show-count max-length="200"></ooa-textarea>
          <ooa-otp length="6"></ooa-otp>
        </div>
      </section>
    </ooa-config-provider>
  </main>
`, app);
