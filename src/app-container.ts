import { TextField } from '@material/mwc-textfield'
import { css, html, LitElement, PropertyDeclaration } from 'lit'
import { customElement, query, queryAll, state } from 'lit/decorators.js'
import { PairStrip } from './pair-strip';
import { RefreshTimer } from './refresh-timer';
import { globalStyles } from './styles/global-styles'
import { breakPair } from './util';
import '@vdegenne/my-footer-element'

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {

  @state()
  private staticVersion = true;

  @query('#pairInput') pairInput!: TextField;
  @queryAll('pair-strip') pairStrips!: PairStrip[];
  @query('refresh-timer') refreshTimer!: RefreshTimer;

  constructor () {
    super()
    fetch('/ping').then(response => {
      if (response.status !== 404) {
        this.staticVersion = false
      }
    })
  }

  static styles = [
    globalStyles,
    css`
    my-footer-element {
      background-color: #0000007a;
    }
    `
  ]

  render () {
    // const pairs = window.changesManager.getSortedPairsByChanges().map(i => {
    //   return i[0]
    // })
    const pairs = window.klinesManager.getSortedPairsByProgressiveVolumes().map(i => {
      return i[0]
    })

    // console.log(pairs)

    return html`
    <session-time-progress></session-time-progress>

    <header class="flex" style="align-items:flex-start;justify-content:space-between">
      <img src="./img/icon.png" width="68px" style="margin:8px 0 0 5px">
      <!-- <span style="flex:1">binance-live</span> -->
    <div style="margin-top:10px">
      <span>(scale : ${window.settingsDialog.settings.width}${window.settingsDialog.settings.unit.toLocaleUpperCase()})</span>
      <refresh-timer></refresh-timer>
    </div>
      <mwc-icon-button icon="settings"
        @click=${() => window.settingsDialog.open()}></mwc-icon-button>
    </header>

    <div class="flex" style="margin:24px 12px;">
      <mwc-textfield id="pairInput" placeholder="add pairname (e.g. BTC/USDT)" style="--mdc-text-field-fill-color: #00ff142b;"
        @keyup=${e => e.key === 'Enter' && this.onAddPairButtonClick()}></mwc-textfield>
      <mwc-icon-button icon="add" style="margin:7px"
        @click=${() => this.onAddPairButtonClick()}></mwc-icon-button>
    </div>

    <div style="max-width:600px;margin:0 auto 128px">
      <div style="text-align:right">
        <mwc-button outlined dense style="--mdc-typography-button-font-size:0.6em;cursor:pointer;min-width:104px;"
          label=mixed
          @click=${(e) => this.onChartDisplayTypeClick(e)}></mwc-button>
      </div>
      ${pairs.map(p => html`<pair-strip .pair="${p} ${Date.now()}"></pair-strip>`)}
    </div>

    <!-- <my-footer-element style="position:fixed;bottom:0" @copied=${() => window.toast('bitcoin address copied')}></my-footer-element> -->
    `
  }

  private onChartDisplayTypeClick(e) {
    if (e.target.label === 'prices') {
      e.target.label = 'volumes'
      this.pairStrips.forEach(el => el.volumeChartElement.state = 1)
    }
    else if (e.target.label === 'volumes') {
      e.target.label = 'mixed'
      this.pairStrips.forEach(el => el.volumeChartElement.state = 2)
    }
    else {
      e.target.label = 'prices'
      this.pairStrips.forEach(el => el.volumeChartElement.state = 0)
    }
  }

  protected updated(_changedProperties: Map<string | number | symbol, unknown>): void {
    // this.refreshTimer.setTimer(window.settingsDialog.settings.refreshEvery)
  }

  protected firstUpdated(_changedProperties: Map<string | number | symbol, unknown>): void {
    window.klinesManager.update()
  }

  private async onAddPairButtonClick() {
    let pairname = this.pairInput.value
    if (pairname === '') return;
    // if (!pairname.includes('/')) {
    //   window.toast('Please use "/" to separate the symbol and the quote')
    //   return
    // }
    // We should verify that the pair exists
    let [symbol, quote] = pairname.toUpperCase().split('/')
    if (!quote) {
      quote = 'USDT'
    }
    if (!window.pairsManager.pairExists(symbol, quote)) {
      window.toast('This pair is unavailable')
      return;
    }
    window.pairsManager.addPair(symbol, quote)
    await window.klinesManager.updatePair(`${symbol}/${quote}`)
    this.requestUpdate()
    this.pairInput.value = ''
    window.toast(`Pair ${symbol}/${quote} added`)
    window.pairsManager.save()
  }

  public updateStrip (pair: string) {
    let info = breakPair(pair)
    if (info === null) {
      return;
    }
    const { symbol, quote } = info
    const strip = [...this.pairStrips].find(el => el.pair === pair)
    if (strip) {
      strip.requestUpdate()
    }
  }
}