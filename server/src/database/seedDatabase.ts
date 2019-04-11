import fetch, { Response } from 'node-fetch'
import { addCryptoCurrency } from './crypto_currencies/addCryptoCurrency'
require('dotenv').config()

export async function seedDatabase() {
    const cryptoCompareCoinListUrl = `https://min-api.cryptocompare.com/data/all/coinlist?api_key=${process.env.CRYPTO_COMPARE_KEY}`

    const response: Response = await fetch(cryptoCompareCoinListUrl)
    const { Data: data } = await response.json()

    await Promise.all(Object.keys(data).map(async key => {
        const crypto = data[key]
        const cryptoData = {
            name: crypto.FullName,
            symbol: crypto.Symbol,
        }

        await addCryptoCurrency(cryptoData)
    }))
}
