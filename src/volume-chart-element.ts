import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js'
import { close_index, open_index, volume_index } from './klines';
import { percentRatio } from './util';

@customElement('volume-chart-element')
export class VolumeChartElement extends LitElement {

  @property()
  pair?: string;

  @property({ type: Number })
  private maxWidth = 50;

  static styles = css`
  :host {
    display: flex;
    align-items: flex-end;
    height: 50px;
  }
  .bar {
    min-width: 6px;
    margin: 0 1px;
    box-sizing: border-box;
    /* background-color: var(--green-color) */
  }
  .red {
    background-color: var(--red-color)
  }
  .green {
    background-color: var(--green-color)
  }
  `

  render () {
    // console.log('volume chart updated')
    if (this.pair === undefined
      || window.klinesManager.klines[this.pair] === undefined) return nothing;

    // Get the klines
    const klines = window.klinesManager.klines[this.pair].slice(-this.maxWidth)
    // Get the highest volume value
    const highest = Math.max(...klines.map(k => k[volume_index]))

    return html`
    ${klines.map((k, i) => {
      const clazz = classMap({
        bar: true,
        red: k[close_index] < k[open_index],
        green: k[close_index] >= k[open_index]
      })
      const stylez = styleMap({
        height: `${percentRatio(highest, k[volume_index])}%`,
        opacity: `${percentRatio(klines.length, i)}%`
      })

      return html`<div class="bar"
        class=${clazz}
        style=${stylez}></div>`
    })}
    `
  }
}