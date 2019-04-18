import { database } from '../setupDatabase'

interface AddCryptoCurrencyArgs {
    name: string
    symbol: string
    sort_order: number
}

export async function addCryptoCurrency(args: AddCryptoCurrencyArgs) {
    const { name, symbol, sort_order } = args

    try {
        const { rows } = await database.query(
            'INSERT INTO crypto_currencies (name, symbol, sort_order) VALUES ($1, $2, $3) RETURNING *;',
            [ name, symbol, sort_order ]
        )

        return rows[0]
    } catch (error) {
        throw new Error(error.message)
    }
}
