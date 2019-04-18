import { database } from '../setupDatabase'

export async function getAllCryptoCurrencies() {
    try {
        const { rows } = await database.query(
            `SELECT * FROM crypto_currencies
            WHERE sort_order <= 50
            ORDER BY name ASC;`
        )

        return rows
    } catch (error) {
        throw new Error(error.message)
    }
}
