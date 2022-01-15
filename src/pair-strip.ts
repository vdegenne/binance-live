import { css, html, LitElement, nothing, PropertyDeclaration } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { breakPair, openCryptowatchLink } from './util';
import { VolumeChartElement } from './volume-chart-element';
import coinmarketcap from 'coinmarketcap-s2l'

@customElement('pair-strip')
export class PairStrip extends LitElement {
  @state()
  public pair!: string;

  @query('volume-chart-element') volumeChartElement!: VolumeChartElement;

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
    return html`
    <span style="cursor:pointer"
      @click=${() => window.open(coinmarketcap(breakPair(this.pair)!.symbol), '_blank')}>${this.pair}</span>
    <volume-chart-element .pair=${this.pair}></volume-chart-element>
    `
  }

  // requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration<unknown, unknown>): void {
  //   // super.requestUpdate(name, oldValue, options)
  //   this.updateComplete.then(() => {
  //     this.volumeChartElement.requestUpdate()
  //   })
  // }
}