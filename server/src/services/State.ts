import { ShortCryptoPrice } from '../../../shared/types/CryptoCompare'

interface StateProps {
    currentPrices?: ShortCryptoPrice
}

export class State {
    public currentPrices = this.props.currentPrices || undefined

    constructor(private props: StateProps) {}

    public set(key: string, value: any) {
        this[key] = value
    }

    public get(key: string) {
        return this[key]
    }
}
