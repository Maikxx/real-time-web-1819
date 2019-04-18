export interface CryptoCurrency {
    _id: number
    name: string
    symbol: string
    value_history: number
    current_value: number
    created_at: Date
}

export type BetType = 'HIGH' | 'LOW'
