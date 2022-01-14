import { TextField } from '@material/mwc-textfield'
import { css, html, LitElement, PropertyDeclaration } from 'lit'
import { customElement, query, queryAll, state } from 'lit/decorators.js'
import { PairStrip } from './pair-strip';
import { globalStyles } from './styles/global-styles'
import { breakPair } from './util';

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {

  @query('#pairInput') pairInput!: TextField;
  @queryAll('pair-strip') pairStrips!: PairStrip[];

  static styles = [
    globalStyles,
    css`
    `
  ]

  render () {
    const pairs = window.klinesManager.getSortedPairsByProgressiveVolumes().map(i => {
      let strip = new PairStrip
      strip.pair = i[0]
      return strip
    })

    return html`
    <session-time-progress></session-time-progress>

    <header class="flex" style="align-items:center;justify-content:space-between">
      <img src="/img/icon.png" width="68px" style="margin:8px 0 0 5px">
      <!-- <span style="flex:1">binance-live</span> -->
      <mwc-icon-button icon="settings"
        @click=${() => window.settingsDialog.open()}></mwc-icon-button>
    </header>

    <div class="flex" style="margin:24px 12px;">
      <mwc-textfield id="pairInput" placeholder="add pairname (e.g. BTC/USDT)"
        @keyup=${e => e.key === 'Enter' && this.onAddPairButtonClick()}></mwc-textfield>
      <mwc-icon-button icon="add" style="margin:7px"
        @click=${() => this.onAddPairButtonClick()}></mwc-icon-button>
    </div>

    <div style="max-width:600px;margin:0 auto">${pairs}
    </div>
    `
  }

  protected firstUpdated(_changedProperties: Map<string | number | symbol, unknown>): void {
    window.klinesManager.update()
  }

  // requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration<unknown, unknown>): void {
  //   // super.requestUpdate(name, oldValue, options)
  //   this.updateComplete.then(() => {
  //     this.pairStrips.forEach(el => el.requestUpdate())
  //   })
  // }

  private onAddPairButtonClick() {
    let pairname = this.pairInput.value
    if (pairname === '') return;
    if (!pairname.includes('/')) {
      window.toast('Please use "/" to separate the symbol and the quote')
      return
    }
    // We should verify that the pair exists
    const [symbol, quote] = pairname.toUpperCase().split('/')
    if (!window.pairsManager.pairExists(symbol, quote)) {
      window.toast('This pair is unavailable')
      return;
    }
    window.pairsManager.addPair(symbol, quote)
    window.klinesManager.updatePair(pairname)
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