import type { Currency, FxQuote, FxQuoteHistorical } from '@lovehold/shared'

export const FX_ADAPTER = Symbol('FX_ADAPTER')

export type FxAdapter = {
  getQuote(input: { base: Currency; quote: Currency; asOf: string }): Promise<FxQuote | null>
  getHistoricalQuote(input: { base: Currency; quote: Currency; transactionOn: string }): Promise<FxQuoteHistorical | null>
}

/** In-memory adapter for V1. It deliberately returns null when no exact quote exists. */
export class ConfigurableFxAdapter implements FxAdapter {
  constructor(
    private readonly quotes: FxQuote[] = [],
    private readonly historicalQuotes: FxQuoteHistorical[] = [],
  ) {}

  async getQuote({ base, quote, asOf }: { base: Currency; quote: Currency; asOf: string }) {
    return this.quotes.find((item) => item.baseCurrency === base && item.quoteCurrency === quote && item.asOf === asOf) ?? null
  }

  async getHistoricalQuote({ base, quote, transactionOn }: { base: Currency; quote: Currency; transactionOn: string }) {
    return this.historicalQuotes.find((item) => item.baseCurrency === base && item.quoteCurrency === quote && item.transactionOn === transactionOn) ?? null
  }
}
