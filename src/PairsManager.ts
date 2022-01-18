
declare global {
  interface Window {
    pairsManager: PairsManager;
  }
}

export class PairsManager {
  public availablePairs: { s: string, q: string }[] = [];
  public pairs: string[] = [];

  constructor() {
    this.loadPairs()
    this.fetchAvailablePairs()
  }

  addPair(symbol: string, quote: string) {
    symbol = symbol.toLocaleUpperCase()
    quote = quote.toLocaleUpperCase()
    const pair = `${symbol}/${quote}`
    if (this.pairs.includes(pair)) { return }
    this.pairs.push(pair)
    if (window.location.hash.length > 1) {
      window.location.hash += ','
    }
    window.location.hash += pair
    return pair
  }

  deletePair(symbol: string, quote: string) {
    symbol = symbol.toLocaleUpperCase()
    quote = quote.toLocaleUpperCase()
    const pair = `${symbol}/${quote}`
    const index = this.pairs.indexOf(pair)
    if (index < 0) {
      return undefined
    }
    window.location.hash = window.location.hash.slice(1).split(',').filter(p => p !== pair).join(',')
    return this.pairs.splice(index, 1)
  }

  loadPairs () {
    let hash = window.location.hash.slice(1)
    if (hash) {
      this.pairs = hash.split(',')
      // console.log(this.pairs)
    }
    // if (localStorage.getItem('pairs'))  {
    //   this.pairs = JSON.parse(localStorage.getItem('pairs')!.toString())
    // }
  }

  async fetchAvailablePairs () {
    const response = await fetch(`https://www.binance.com/api/v3/exchangeInfo`)
    const data = await response.json()
    this.availablePairs = data.symbols.map(s => ({
      s: s.baseAsset,
      q: s.quoteAsset
    }))
  }

  pairExists (symbol: string, quote: string) {
    return this.availablePairs.some(p => p.s === symbol && p.q === quote)
  }

  save () {
    localStorage.setItem('pairs', JSON.stringify(this.pairs))
  }
}

window.pairsManager = new PairsManager