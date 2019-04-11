import express from 'express'
import { getAllCryptoCurrencies } from '../database/crypto_currencies/getAllCryptoCurrencies'
import { CryptoCurrency } from '../types/CryptoCurrency'

export async function getGroupCreateRoute(request: express.Request, response: express.Response) {
    try {
        const cryptoCurrencies: CryptoCurrency[] = await getAllCryptoCurrencies()

        response.status(200).render('view/groups/create', {
            cryptoCurrencies,
        })
    } catch (error) {
        console.error(error.message)
        response.status(500).redirect('/')
    }
}
