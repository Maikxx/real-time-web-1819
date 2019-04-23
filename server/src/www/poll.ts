require('dotenv').config()
import fetch from 'node-fetch'
import Poll from 'async-polling'
import _, { uniqBy } from 'lodash'
import { database } from '../database/setupDatabase'
import { CryptoCurrency } from '../types/CryptoCurrency'
import { groupScoreChanged } from './events'

export async function setupPolling(full?: boolean) {
    try {
        const { rows: cryptoCurrencies } = await database.query(
            `SELECT
                symbol
            FROM crypto_currencies
            WHERE sort_order <= 50
            ORDER BY name ASC;`
        )

        if (cryptoCurrencies && cryptoCurrencies.length > 0) {
            const poll = Poll(async end => {
                try {
                    const urlBase = `https://min-api.cryptocompare.com`
                    const route = full
                        ? `pricemultifull`
                        : `pricemulti`
                    const cryptoCoins = cryptoCurrencies.map((cryptoCurrency: CryptoCurrency) => cryptoCurrency.symbol)
                    const fsyms = `fsyms=${cryptoCoins.join(',')}`
                    const response = await fetch(`${urlBase}/data/${route}?${fsyms}&tsyms=EUR&api_key=${process.env.CRYPTO_COMPARE_KEY}`)
                    const data = await response.json()

                    await Promise.all(Object.keys(data).map(async key => {
                        const crypto = data[key]

                        const { rows: cryptoCurrencyRows } = await database.query(
                            `UPDATE crypto_currencies
                            SET
                                value_history = current_value,
                                current_value = $1
                            WHERE symbol = $2
                            RETURNING *;`,
                            [ crypto.EUR, key ]
                        )

                        if (cryptoCurrencyRows && cryptoCurrencyRows.length > 0) {
                            await Promise.all(cryptoCurrencyRows.map(async (cryptoCurrency: CryptoCurrency) => {
                                if (cryptoCurrency.current_value === cryptoCurrency.value_history) {
                                    return
                                }

                                const bettingStatus = cryptoCurrency.current_value > cryptoCurrency.value_history
                                    ? 'HIGH'
                                    : 'LOW'

                                const { rows: groupParticipants } = await database.query(
                                    `SELECT
                                        group_participants._id,
                                        group_participants.bet,
                                        group_participants.group_id
                                    FROM group_participants
                                    LEFT JOIN groups
                                        ON (groups._id = group_participants.group_id)
                                    WHERE groups.crypto_currency = $1;`,
                                    [cryptoCurrency._id]
                                )

                                if (groupParticipants && groupParticipants.length > 0) {
                                    const participants = await Promise.all(groupParticipants.map(async ({ _id: participantId, bet }) => {
                                        const addOrMinus = bet === bettingStatus ? '+' : '-'

                                        const { rows } = await database.query(
                                            `UPDATE group_participants
                                            SET
                                                score = score ${addOrMinus} 1,
                                                hypothetical_gain = hypothetical_gain ${addOrMinus} effort
                                            WHERE group_participants._id = $1
                                            RETURNING *;`,
                                            [participantId]
                                        )

                                        if (rows && rows.length > 0) {
                                            return rows[0]
                                        }
                                    }))

                                    const uniqueGroupIds = uniqBy(participants, 'group_id').map(participant => participant.group_id)
                                    uniqueGroupIds.forEach(groupId => {
                                        const participantsForGroup = participants.filter(participant => participant.group_id === groupId)
                                        groupScoreChanged.emit(`group-${groupId}-changed`, participantsForGroup)
                                    })
                                }
                            }))
                        }
                    }))

                    end(undefined, data)
                } catch (error) {
                    end(error)
                    console.error(error)
                    throw new Error(error)
                }
            }, 1000)

            return poll
        }

        return null
    } catch (error) {
        console.error(error.message)
    }

    return null
}
