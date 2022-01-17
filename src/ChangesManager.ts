import { breakPair } from './util'

declare global {
  interface Window {
    changesManager: ChangesManager
  }
}

export class ChangesManager {
  private _changes: { [pairname: string]: number } = {}

  constructor () {
    // this.update()
  }

  get changes () {
    return Object.fromEntries(
      Object.entries(this._changes).filter(([pair, c]) => window.pairsManager.pairs.some(p => p.replace('/', '') === pair)).map(([pair, c]) => {
        return [window.pairsManager.pairs.find(p => p.replace('/', '') === pair), c]
      })
    ) as { [pair: string]: number }
  }

  getChange (pair: string) {
    const pairInfo = breakPair(pair)
    return this._changes[`${pairInfo?.symbol}${pairInfo?.quote}`]
  }

  public async update () {
    const response = await fetch(`https://www.binance.com/api/v3/ticker/24hr`)
    const changes = await response.json()
    this._changes = Object.fromEntries(changes.map(c => [c.symbol, c.priceChangePercent]))
  }

  getSortedPairsByChanges () {
    return Object.entries(this.changes).sort(function (a, b) {
      return b[1] - a[1]
    })
  }
}

window.changesManager = new ChangesManager