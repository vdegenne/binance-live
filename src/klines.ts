import ms from 'ms'

export const open_time_index = 0;
export const open_index = 1;
export const high_index = 2;
export const low_index = 3;
export const close_index = 4;
export const volume_index = 5;
export const close_time_index = 6;
export const quote_asset_volume_index = 7;
export const number_of_trades_index = 8;
export const taker_buy_base_asset_volume_index = 9;
export const taker_buy_quote_asset_volume_index = 10;
export const ignore_index = 11;

export type RawKline = [
  number, // open time
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // close time
  string, // quote asset volume
  number, // number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string // Ignore.
]

export type Kline = [
  number, // open time
  number, // open
  number, // high
  number, // low
  number, // close
  number, // volume
  number, // close time
]

export function parseRawKlines(klines: RawKline[]): Kline[] {
  return klines.map(k => [
    k[open_time_index],
    parseFloat(k[open_index]),
    parseFloat(k[high_index]),
    parseFloat(k[low_index]),
    parseFloat(k[close_index]),
    parseFloat(k[volume_index]),
    k[close_time_index]
  ])
}

export async function fetchPairKlines(pair: string, unit: 'd' | 'h' | 'm' = 'd', startTime?: number, endTime?: number): Promise<RawKline[]> {
  let url = `https://www.binance.com/api/v3/klines?symbol=${pair}&interval=1${unit}`;
  if (!startTime) {
    // 180 units by default
    startTime = Date.now() - ms(`180${unit}`)
  }
  url += `&startTime=${startTime}`
  if (endTime) {
    url += `&endTime=${endTime}`
  }
  const response = await fetch(url)
  return await response.json()
}

export function klineIsRed (kline: Kline) {
  return kline[close_index] < kline[open_index]
}
export function klineIsGreen (kline: Kline) {
  return !klineIsRed(kline)
}