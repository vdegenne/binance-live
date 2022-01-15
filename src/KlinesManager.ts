import { close_index, fetchPairKlines, Kline, open_index, parseRawKlines, volume_index } from './klines';
import ms from 'ms'
import { breakPair } from './util';
import { AppContainer } from './app-container';

declare global {
  interface Window {
    klinesManager: KlinesManager;
  }
}

export type UpdaterState = 'stopped'|'waiting'|'pending';

export class KlinesManager {
  private _klines: { [pair: string]: Kline[] } = {}
  private pairUpdateTimestampMap: {[pairname: string]: number} = {}

  private state: UpdaterState = 'stopped';

  public get klines () {
    return Object.fromEntries(
      Object.entries(this._klines).filter(([p, k]) => window.pairsManager.pairs.includes(p))
    )
  }

  private _timeout?: NodeJS.Timeout;
  initiateTimeout (timeoutMs?: number) {
    if (!timeoutMs) {
      timeoutMs = window.settingsDialog.settings.refreshEvery * 1000
    }

    this.clearTimeout()

    this._timeout = setTimeout(() => this.update(), timeoutMs)
    this.state = 'waiting'
  }

  clearTimeout () {
    if (this._timeout !== undefined) {
      clearTimeout(this._timeout)
      this._timeout = undefined;
    }
  }

  start () {
    // TODO: make a stopped timestamp variable
    // and when the updater is started again verify if it was stopped x secs ago
    // If the time is greater than this past time we should fetch the data before initiating the timeout again
    // This prevents the data to be fetched multiple times if the user clicks on the start/stop button too quickly
    this.initiateTimeout()
  }

  stop () {
    this.clearTimeout()
    this.state = 'stopped'
  }

  async update () {
    this.state = 'pending'
    await Promise.all(
    window.pairsManager.pairs.map(async (pair) => {
      await this.updatePair(pair)
      // const [symbol, quote] = pair.split('/')
      // const raw = await fetchPairKlines(
      //   `${symbol}${quote}`,
      //   window.settingsDialog.settings.unit,
      //   Date.now() - ms(`${window.settingsDialog.settings.width}${window.settingsDialog.settings.unit}`)
      // )
      // this.klines[pair] = parseRawKlines(raw)
    })
    )
    // setTimeout(() => console.log(this.klines), 100)
    window.app.requestUpdate()
    this.initiateTimeout()
  }


  async updatePair (pair: string, force: boolean = false): Promise<Kline[]|null> {
    const p = breakPair(pair)
    if (p === null) { return null }
    const {symbol, quote} = p
    if (!force && this.pairUpdateTimestampMap[`${symbol}/${quote}`] && Date.now() - this.pairUpdateTimestampMap[`${symbol}/${quote}`] < 2000) { return null }
    const raw = await fetchPairKlines(
      `${symbol}${quote}`,
      window.settingsDialog.settings.unit,
      Date.now() - ms(`${window.settingsDialog.settings.width}${window.settingsDialog.settings.unit}`)
    )
    this.pairUpdateTimestampMap[`${symbol}/${quote}`] = Date.now();
    // window.app.updateStrip(pair)
    // this.debounceUpdateAppView()
    return this._klines[`${symbol}/${quote}`] = parseRawKlines(raw)
  }

  private _appUpdateViewDebouncer?: NodeJS.Timeout;
  debounceUpdateAppView () {
    if (this._appUpdateViewDebouncer) {
      clearTimeout(this._appUpdateViewDebouncer)
      this._appUpdateViewDebouncer = undefined
    }
    this._appUpdateViewDebouncer = setTimeout(() => {
      window.app.requestUpdate()
      this._appUpdateViewDebouncer = undefined
    }, 1000)
  }

  getSortedPairsByProgressiveVolumes (): [string, Kline[]][] {
    const map = Object.entries(this._klines).map(function ([pair, klines]) {
      let candle, previous, i = 0
      while (1) {
        candle = klines[klines.length - 1 - (i)]
        previous = klines[klines.length - 1 - (i + 1)]
        if (candle[close_index] < candle[open_index])
          break;
        i++;
        if (previous === undefined || candle[volume_index] < previous[volume_index])
          break;
      }

      return {
        pair,
        progression: i,
        klines
      }
    })
    // console.log(map)
    return map.sort((a, b) => b.progression - a.progression).map(i => [i.pair, i.klines])
  }
}

window.klinesManager = new KlinesManager