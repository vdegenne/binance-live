import { css, html, LitElement, nothing, PropertyDeclaration } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { breakPair, change, openCryptowatch, percentTemplate } from './util';
import { VolumeChartElement } from './volume-chart-element';
import coinmarketcap from 'coinmarketcap-s2l'
import { close_index } from './klines';
import '@material/mwc-menu'
import { Menu } from '@material/mwc-menu';

@customElement('pair-strip')
export class PairStrip extends LitElement {
  @state()
  public pair!: string;

  @query('volume-chart-element') volumeChartElement!: VolumeChartElement;
  @query('#price-frame') priceFrame!: HTMLDivElement;
  @query('mwc-menu') menu!: Menu;


  static styles = css`
  :host {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border: 1px solid var(--green-color);
    padding: 6px;
    padding-bottom: 0;
    margin: 6px;
    border-radius: 4px;
    background-color: #001401;
  }
  `

  render () {
    this.pair = this.pair.split(' ')[0]
    let klines = window.klinesManager.klines[this.pair]
    let firstPrice = klines[0][close_index]
    let lastPrice = klines[klines.length - 1][close_index]
    let _change = change(firstPrice, lastPrice)

    return html`
    <div style="display:flex;flex-direction:column;justify-content:space-between;height:44px">
      <div style="display:flex;align-items:center">
        <div id="price-frame" style="cursor:pointer;position:relative">
          <span @click=${() => this.menu.show()}>${this.pair}</span>
          <mwc-menu corner="BOTTOM_LEFT" style="--mdc-ripple-color:var(--green-color);--mdc-ripple-hover-opacity:0.1">
            <mwc-list-item
                graphic="icon"
                @click=${() => window.open(coinmarketcap(breakPair(this.pair)!.symbol), '_blank')}>
              <mwc-icon slot="graphic"><img src="./img/coinmarketcap.ico" width=24></mwc-icon>
              Coinmarketcap
            </mwc-list-item>
            <mwc-list-item
                graphic="icon"
                @click=${() => openCryptowatch(this.pair)}>
              <mwc-icon slot="graphic"><img src="./img/cryptowatch.png" width=24></mwc-icon>
              Cryptowatch
            </mwc-list-item>
            <mwc-list-item graphic="icon"
                @click=${() => this.delete()}>
              <mwc-icon slot="graphic" style="color:var(--green-color)">remove</mwc-icon>
              Delete
            </mwc-list-item>
          </mwc-menu>
        </div>
        ${percentTemplate(_change)}<br>
      </div>
      <div style="font-size:0.7em;opacity:0.7;">${lastPrice}</div>
    </div>
    <volume-chart-element .pair=${this.pair}></volume-chart-element>
    `
  }

  protected firstUpdated(_changedProperties: Map<string | number | symbol, unknown>): void {
    this.menu.anchor = this.priceFrame
  }

  protected updated(_changedProperties: Map<string | number | symbol, unknown>): void {
    this.volumeChartElement.requestUpdate()
  }

  // requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration<unknown, unknown>): void {
  //   // super.requestUpdate(name, oldValue, options)
  //   this.updateComplete.then(() => {
  //     this.volumeChartElement.requestUpdate()
  //   })
  // }

  public delete () {
    const {symbol, quote} = breakPair(this.pair)!
    window.pairsManager.deletePair(symbol, quote)
    window.app.requestUpdate()
    // this.remove()
  }
}