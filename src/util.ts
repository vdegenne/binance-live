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

export function percentRatio (max: number, value: number) {
  return (value * 100) / max
}


export function openCryptowatchLink(pair: string) {
  const { symbol, quote } = breakPair(pair)!
  window.open(
    `https://cryptowat.ch/charts/binance:${symbol}-${quote}`,
    '_blank'
  )
}