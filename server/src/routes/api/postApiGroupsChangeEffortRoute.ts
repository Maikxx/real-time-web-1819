import express from 'express'
import { database } from '../../database/setupDatabase'

interface Params {
    groupId?: string
    participantId?: string
}

interface Body {
    effort?: number
}

export async function postApiGroupsChangeEffortRoute(request: express.Request, response: express.Response) {
    const { groupId, participantId } = request.params as Params
    const { effort } = request.body as Body

    if (groupId && participantId && !isNaN(Number(groupId)) && !isNaN(Number(participantId)) && isValidEffort(effort)) {
        const groupIdNumber = Number(groupId)
        const participantIdNumber = Number(participantId)

        try {
            await database.query(
                `UPDATE group_participants SET effort = $1 WHERE _id = $2 AND group_id = $3;`,
                [ effort, participantIdNumber, groupIdNumber ]
            )

            response.status(200).json({
                error: null,
                success: true,
            })
        } catch (error) {
            console.error(error.message)
            response.status(500).json({
                error: 'It looks like the database could not update your effort.',
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

function isValidEffort(effort?: number) {
    return typeof effort === 'number'
        && effort >= 1
        && effort <= 50
        && Number.isInteger(effort)
}
