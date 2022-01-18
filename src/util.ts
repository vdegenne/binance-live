import { html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'

export type Pair = {
  symbol: string,
  quote: string
}

export function breakPair (pair: string): Pair|null {
  let symbol, quote
  if (pair.includes('/')) {
    [symbol, quote] = pair.toLocaleUpperCase().split('/')
    return { symbol, quote }
  }
  let found = window.pairsManager.availablePairs.find(p => `${p.s}${p.q}` === pair)
  if (found) {
    return {
      symbol: found.s,
      quote: found.q
    }
  }

  return null; // not found
}

export function round(value: number, precision = 2) {
  return Math.round(value * (10 ** precision)) / (10 ** precision);
}

export function valueToPercent (max: number, value: number) {
  return (value * 100) / max
}
export function percentToValue (max: number, percent: number) {
  return (max * percent) / 100
}


export function openCryptowatch(pair: string) {
  const { symbol, quote } = breakPair(pair)!
  window.open(
    `https://cryptowat.ch/charts/binance:${symbol}-${quote}`,
    '_blank'
  )
}

export function change(a: number, b: number) {
  return 100 * (b - a) / a;
}


export function percentTemplate (percent: string|number) {
  percent = round(parseFloat(percent as string))
  const style = styleMap({
    backgroundColor: percent === 0 ? 'grey' : (percent < 0 ? 'var(--red-color)' : 'var(--green-color)'),
    fontSize: '0.7em',
    padding: '2px 5px',
    borderRadius: '4px',
    color: percent >= 0 ? 'black' : 'white',
    marginLeft: '5px'
  })

  return html`<span class="percent" style=${style}>${percent}%</span>`
}
