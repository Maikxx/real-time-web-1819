import io from 'socket.io-client'
import { ShortCryptoPrice } from './types/CryptoCompare'

const socket = io()

socket.on('new-data-gathered', ({ BCH, BTC, ETH, LTC, XLM, XMR }: ShortCryptoPrice) => {
    const dataTextContainer: HTMLElement | null = document.querySelector('#crypto-data')
    const dataChartContainer: HTMLElement | null = document.querySelector('#chart')
    const totalAmountOfMoney = BCH.EUR + BTC.EUR + ETH.EUR + LTC.EUR + XLM.EUR + XMR.EUR

    if (dataTextContainer && dataChartContainer) {
        const status = dataTextContainer.innerText
        const bitcoinIndex = status.indexOf('€')
        const currentBitcoinCount = status.slice(bitcoinIndex + 1, status.indexOf(','))

        if (currentBitcoinCount) {
            if (BTC.EUR >= Number(currentBitcoinCount)) {
                dataTextContainer.classList.remove('down')
                dataTextContainer.classList.add('up')
            } else {
                dataTextContainer.classList.remove('up')
                dataTextContainer.classList.add('down')
            }
        }

        // tslint:disable-next-line:ter-max-len
        dataTextContainer.innerText = `Bitcoin: €${BTC.EUR}, Etherium: €${ETH.EUR}, Bitcoin Cash: €${BCH.EUR}, Litecoin: €${LTC.EUR}, Stellar: €${XLM.EUR}, Monero: €${XMR.EUR}. Total: €${totalAmountOfMoney}`
    }
})
