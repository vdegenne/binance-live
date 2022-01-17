import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { valueToPercent } from './util';

@customElement('session-time-progress')
export class SessionTimeProgress extends LitElement {
  static styles = css`
  mwc-linear-progress {
    --mdc-linear-progress-buffer-color: black;
    background-color: black;
  }
  `
  render() {
    let progress
    switch (window.settingsDialog.settings.unit) {
      case 'h':
        progress = valueToPercent(60, (new Date).getMinutes()) / 100
      break;
      case 'm':
        progress = valueToPercent(60, (new Date).getSeconds()) / 100
        break;
    }

    return html`
    <mwc-linear-progress progress=${progress}></mwc-linear-progress>
    `
  }

  protected firstUpdated(_changedProperties: Map<string | number | symbol, unknown>): void {
    window.setInterval(() => this.requestUpdate(), 1000)
  }
}