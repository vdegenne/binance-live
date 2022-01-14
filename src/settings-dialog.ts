import { Dialog } from '@material/mwc-dialog';
import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { globalStyles } from './styles/global-styles';

declare global {
  interface Window {
    settingsDialog: SettingsDialog;
  }
}

export type Settings = {
  unit: 'm'|'h'|'d',
  width: number,
  refreshEvery: number
}

@customElement('settings-dialog')
export class SettingsDialog extends LitElement {
  // @state()
  public settings: Settings = this.default;
  @state()
  private _settings: Settings = this.default;

  @query('mwc-dialog') dialog!: Dialog;

  constructor() {
    super()
    this.loadSettings()
  }

  loadSettings () {
    if (localStorage.getItem('binance-live:settings')) {
      this.settings = JSON.parse(localStorage.getItem('binance-live:settings')!.toString())
    }
    else {
      this.settings = this.default
    }
    // Clone the settings for the view
    this._settings = JSON.parse(JSON.stringify(this.settings))
  }

  static styles = [
    globalStyles,
    css`
    .title {
      font-weight: bold;
      margin-bottom: 9px;
      margin-top: 24px;
    }
    /* .title:first-of-type {
       margin-top: 0;
     } */

    mwc-textfield, mwc-select {
      margin: 8px 0;
    }
  `]

  get default (): Settings {
    return {
      unit: 'h',
      width: 6,
      refreshEvery: 10
    }
  }

  render () {
    const constrained = this.constrainSettingsObject(this._settings)

    return html`
    <mwc-dialog heading="Settings">
      <div>
        <div class="title">Data Context</div>
        <mwc-select outlined label="unit" style="color:green"
          value=${this._settings.unit}
          @change=${e=>{ this._settings.unit=e.target.value;this.requestUpdate() }}>
          <mwc-list-item value="m">minute</mwc-list-item>
          <mwc-list-item value="h">hour</mwc-list-item>
          <mwc-list-item value="d">day</mwc-list-item>
        </mwc-select>

        <mwc-textfield outlined label="width" type="number"
          placeholder="how many candles to fetch"
          value=${this._settings.width}
          @keyup=${e=>{ this._settings.width=parseInt(e.target.value);this.requestUpdate() }}></mwc-textfield>

        <div class="title">Updater</div>
        <mwc-textfield outlined label="refresh frequency (in seconds)" type="number"
          value=${this._settings.refreshEvery}
          @keyup=${e=>{ this._settings.refreshEvery=parseInt(e.target.value);this.requestUpdate() }}></mwc-textfield>


        <div style="margin-top:24px" class="flex">
          <mwc-icon style="margin-right:6px">info</mwc-icon>
          <span>Fetching ${constrained.width} candles (1 candle = 1 ${{m: 'minute', h: 'hour', d: 'day'}[constrained.unit]}) every ${constrained.refreshEvery} seconds.</span>
        </div>
      </div>

      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        @click=${()=>this.onSaveClick()}>save</mwc-button>
    </mwc-dialog>
    `
  }

  private onSaveClick() {
    this.save();
    this.dialog.close()
  }

  constrainSettingsObject(settings: Settings): Settings {
    return {
      unit: settings.unit,
      width: settings.width || this.default.width,
      refreshEvery: settings.refreshEvery || this.default.refreshEvery
    }
  }

  protected firstUpdated(_changedProperties: Map<string | number | symbol, unknown>): void {
    this.dialog.addEventListener('opened', () => {
      this.shadowRoot!.querySelector('mwc-select')!.layout()
      this.shadowRoot!.querySelectorAll('mwc-textfield')!.forEach(el => el.layout())
    })
  }

  open() {
    // Clone the settings for the view
    this._settings = JSON.parse(JSON.stringify(this.settings))
    this.dialog.show()
  }

  save() {
    this.settings = this.constrainSettingsObject(this._settings);
    localStorage.setItem('binance-live:settings', JSON.stringify(this.settings))
    window.toast('Settings saved')
  }
}