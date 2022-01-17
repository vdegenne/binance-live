import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
import { StyleInfo, styleMap } from 'lit/directives/style-map.js'
import { close_index, high_index, low_index, open_index, volume_index } from './klines';
import { percentToValue, valueToPercent } from './util';

@customElement('volume-chart-element')
export class VolumeChartElement extends LitElement {

  @property()
  pair?: string;

  @property({ type: Number })
  private maxWidth = 50;

  static styles = css`
  :host {
    position: relative;
    display: flex;
    justify-content: space-between;
    height: 50px;
    /* flex: 1; */
  }
  .bar {
    min-width: 6px;
    margin: 0 1px;
    box-sizing: border-box;
    /* background-color: var(--green-color) */
  }
  .red {
    /* background-color: var(--red-color); */
    background-color: rgb(103, 58, 183);
  }
  .green {
    /* background-color: var(--green-color); */
    background-color: #ffeb3b;
  }

  .bars-container {
    position: absolute;
    right: 0;
    display: flex;
    align-items: flex-end;
    height: 100%;
  }
  `

  render () {
    if (this.pair === undefined
      || window.klinesManager.klines[this.pair] === undefined) return nothing;
    // Get the klines
    const klines = window.klinesManager.klines[this.pair].slice(-this.maxWidth)
    // Get the highest volume value
    const highest = Math.max(...klines.map(k => k[volume_index]))

    const max = Math.max(...klines.map(k => k[open_index]), ...klines.map(k => k[close_index]), ...klines.map(k => k[low_index]), ...klines.map(k => k[high_index]))
    const min = Math.min(...klines.map(k => k[open_index]), ...klines.map(k => k[close_index]), ...klines.map(k => k[low_index]), ...klines.map(k => k[high_index]))

    return html`
    <div class="bars-container">
    ${klines.map((k, i) => {
      // let styleMapProps: any = {}
      let backgroundColor, height, marginTop, marginBottom
      const opacity = `${valueToPercent(klines.length, i) / 100}`
      if (k[close_index] > k[open_index]) {
        backgroundColor = 'var(--green-color)'
        marginTop = percentToValue(50, valueToPercent(max - min, max - k[close_index]))
        marginBottom = percentToValue(50, valueToPercent(max - min, k[open_index] - min))
      }
      else {
        backgroundColor = 'var(--red-color)'
        marginTop = percentToValue(50, valueToPercent(max - min, max - k[open_index]))
        marginBottom = percentToValue(50, valueToPercent(max - min, k[close_index] - min))
      }

      height = `${50 - marginTop - marginBottom}px`
      marginTop = `${marginTop}px`
      marginBottom = `${marginBottom}px`

      return html`<div class="bar" style=${styleMap({ backgroundColor, height, marginTop, marginBottom, opacity })}></div>`
    })}
    </div>

    <div class="bars-container" style="opacity:0.6">
    ${klines.map((k, i) => {
      const clazz = classMap({
        bar: true,
        red: k[close_index] < k[open_index],
        green: k[close_index] >= k[open_index]
      })
      const stylez = styleMap({
        height: `${valueToPercent(highest, k[volume_index])}%`,
        opacity: `${valueToPercent(klines.length, i)}%`
      })

      return html`<div class=${clazz} style=${stylez}></div>`
    })}
    </div>
    `
  }
}