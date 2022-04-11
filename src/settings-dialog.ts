import { Dialog } from '@material/mwc-dialog';
import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { globalStyles } from './styles/global-styles';
import '@material/mwc-slider'

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
  public settings: Settings = this.default; // real settings
  @state()
  private _settings: Settings = this.default; // modified settings in the view

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

    #info span {
      min-width: 23px;
    display: inline-block;
    text-align: center;
    font-weight: 600;
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

        <p><span class=title>Width</span> (how many candles to display)</p>
        <mwc-slider
          discrete
          withTickMarks
          step=1
          min=2
          max=30
          value=${this._settings.width}
          style="--mdc-theme-on-primary:var(--green-color)"
          @input=${e=>{this._settings.width=e.detail.value;this.requestUpdate()}}
        ></mwc-slider>

        <!-- <mwc-textfield outlined label="width" type="number"
          placeholder="how many candles to fetch"
          value=${this._settings.width}
          @keyup=${e=>{ this._settings.width=parseInt(e.target.value);this.requestUpdate() }}></mwc-textfield> -->

        <div class="title">Updater</div>
        <mwc-textfield outlined label="refresh frequency (in seconds)" type="number"
          value=${this._settings.refreshEvery}
          @change=${e=>{ this._settings.refreshEvery=parseInt(e.target.value);this.requestUpdate()}}></mwc-textfield>


        <div id=info style="margin-top:24px" class="flex">
          <mwc-icon style="margin-right:6px">info</mwc-icon>
          <div>Fetching <span>${constrained.width}</span> candles (1 candle = 1 ${{m: 'minute', h: 'hour', d: 'day'}[constrained.unit]}) every ${constrained.refreshEvery} seconds.</div>
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
      this.shadowRoot!.querySelectorAll('mwc-slider')!.forEach(el=>el.layout())
    })
  }

  open() {
    // Clone the settings for the view
    this._settings = JSON.parse(JSON.stringify(this.settings))
    this.dialog.show()
  }

  save() {
    const settings = this.constrainSettingsObject(this._settings);
    let shouldUpdate = false
    if (settings.unit !== this.settings.unit || settings.width !== this.settings.width) {
      shouldUpdate = true
    }
    this.settings = settings
    if (shouldUpdate) {
      window.klinesManager.update()
    }
    localStorage.setItem('binance-live:settings', JSON.stringify(this.settings))
    window.toast('Settings saved')
  }
}