import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('refresh-timer')
export class RefreshTimer extends LitElement {
  @state()
  private _timer = 0;

  render () {
    return html`next refresh: ${this._timer}`
  }

  private _interval?: NodeJS.Timer;
  setTimer (timeoutS: number) {
    this._timer = timeoutS;
    this.clearInterval()
    this._interval = setInterval(() => {
      this._timer--;
      if (this._timer === 0) {
        this.clearInterval()
      }
    }, 1000)
  }

  private clearInterval () {
    if (this._interval) {
      window.clearInterval(this._interval)
      this._interval = undefined
    }
  }
}