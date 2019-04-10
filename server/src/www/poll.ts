import fetch from 'node-fetch'
import Poll from 'async-polling'
import { ShortCryptoPrice } from '../types/CryptoCompare'
import socket from 'socket.io'
import _ from 'lodash'

export function setupPolling(full?: boolean) {
    const poll = Poll(async end => {
        try {
            const urlBase = `https://min-api.cryptocompare.com`
            const route = full
                ? `pricemultifull`
                : `pricemulti`
            const cryptoCoins = [`BTC`, `ETH`, `XMR`, `XLM`, `LTC`, `BCH`]
            const fsyms = `fsyms=${cryptoCoins.join(',')}`
            const response = await fetch(`${urlBase}/data/${route}?${fsyms}&tsyms=USD,EUR&api_key=${process.env.CRYPTO_COMPARE_KEY}`)
            const data = await response.json()

            end(undefined, data)
        } catch (error) {
            end(error)
            console.error(error)
            throw new Error(error)
        }
    }, 1000)

    return poll
}

export function onPollResult(socket: socket.Socket) {
    return function(newData: ShortCryptoPrice) {
        socket.emit('new-data-gathered', newData)
    }
}
