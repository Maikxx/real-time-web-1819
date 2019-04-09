import io from 'socket.io-client'
import { ShortCryptoPrice } from './types/CryptoCompare'

const socket = io()

socket.on('new-data-gathered', (data: ShortCryptoPrice) => {
    const { BTC, ETH } = data
    const dataContainer = document.querySelector('#crypto-data')

    if (dataContainer) {
        dataContainer.innerHTML = `Bitcoin: €${BTC.EUR}, Etherium: €${ETH.EUR}`
    }
})
