import express from 'express'
import { database } from '../../database/setupDatabase'
import { BetType } from '../../types/CryptoCurrency'

interface Params {
    groupId?: string
    participantId?: string
}

interface Body {
    newBet?: BetType
}

export async function postApiGroupsChangeBetRoute(request: express.Request, response: express.Response) {
    const { groupId, participantId } = request.params as Params
    const { newBet } = request.body as Body

    if (groupId && participantId && !isNaN(Number(groupId)) && !isNaN(Number(participantId)) && newBet && isValidBet(newBet)) {
        const groupIdNumber = Number(groupId)
        const participantIdNumber = Number(participantId)

        try {
            await database.query(
                `UPDATE group_participants SET bet = $1 WHERE _id = $2 AND group_id = $3;`,
                [ newBet, participantIdNumber, groupIdNumber ]
            )

            response.status(200).json({
                error: null,
                success: true,
            })
        } catch (error) {
            console.error(error.message)
            response.status(500).json({
                error: 'It looks like the database could not update your bet.',
                success: false,
            })
        }
    } else {
        console.error('It looks like you did not pass valid parameters to the server!')
        response.status(409).json({
            error: 'It looks like you did not pass valid parameters to the server!',
            success: false,
        })
    }
}

function isValidBet(bet: BetType) {
    return bet === 'HIGH' || bet === 'LOW'
}
