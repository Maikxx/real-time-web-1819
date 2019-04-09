import fetch from 'node-fetch'
import Poll from 'async-polling'
import { ShortCryptoPrice } from '../../../shared/types/CryptoCompare'
import { State } from '../services/State'
import socket from 'socket.io'
import _ from 'lodash'

export function setupPolling(full?: boolean) {
    const poll = Poll(async end => {
        try {
            const urlBase = `https://min-api.cryptocompare.com`
            const route = full
                ? `pricemultifull`
                : `pricemulti`
            const response = await fetch(`${urlBase}/data/${route}?fsyms=BTC,ETH&tsyms=USD,EUR&api_key=${process.env.CRYPTO_COMPARE_KEY}`)
            const data = await response.json()

            end(undefined, data)
        } catch (error) {
            end(error)
            console.error(error)
            throw new Error(error)
        }
    }, 500)

    return poll
}

export function onPollResult(socket: socket.Socket, state: State) {
    return function(newData: ShortCryptoPrice) {
        const previousData = state.get('currentPrices')

        if (!_.isEqual(newData, previousData)) {
            state.set('currentPrices', newData)

            socket.emit('new-data-gathered', newData)
        }
    }
}
