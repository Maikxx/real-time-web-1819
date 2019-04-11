import { database } from '../setupDatabase'

interface AddCryptoCurrencyArgs {
    name: string
    symbol: string
}

export async function addCryptoCurrency(args: AddCryptoCurrencyArgs) {
    const { name, symbol } = args

    try {
        const { rows } = await database.query(
            'INSERT INTO crypto_currencies (name, symbol) VALUES ($1, $2) RETURNING *;',
            [ name, symbol ]
        )

        return rows[0]
    } catch (error) {
        throw new Error(error.message)
    }
}
