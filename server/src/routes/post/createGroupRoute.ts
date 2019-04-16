import express from 'express'
import { User } from '../../types/User'
import { CreateGroupArgs, Group } from '../../types/Group'
import { database } from '../../database/setupDatabase'
import { groupCreationEmitter } from '../../www/events'

export async function postCreateGroupRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        try {
            const user: User = request.user && request.user[0]
            const { name, currency } = request.body as CreateGroupArgs

            if (!name
                || name.length === 0
                || typeof name !== 'string'
                || !currency
                || currency.length === 0
                || isNaN(Number(currency))
            ) {
                console.error('Oops, it looks like that you passed wrong data to the server...')
                return response.status(409).redirect('/groups/create?error=validation')
            }

            if (!user) {
                console.error('It looks like you are not logged in!')
                request.logout()
                response.status(403).redirect('/login?error=authentication')
            }

            const { rows: groupRows } = await database.query(
                `INSERT INTO groups (name, crypto_currency) VALUES ($1, $2) RETURNING _id, name;`,
                [ name, Number(currency) ]
            )

            if (groupRows && groupRows.length > 0) {
                const group: Group = groupRows[0]
                const { rows: groupParticipantRows } = await database.query(
                    `INSERT INTO group_participants (user_id, group_id, score) VALUES ($1, $2, $3) RETURNING _id;`,
                    [ user._id, group._id, 0 ]
                )

                if (groupParticipantRows && groupParticipantRows.length > 0) {
                    groupCreationEmitter.emit('group-created', group)
                    response.status(200).redirect(`/groups/${group._id}`)
                } else {
                    console.error('Oops, for some reason we could not find the group participant that you just made!')
                    response.status(500).redirect('/groups/create?error=internal')
                }
            } else {
                console.error('Oops, for some reason we could not find the group that you just made!')
                response.status(500).redirect('/groups/create?error=internal')
            }
        } catch (error) {
            console.error(error.message)
            response.status(500).redirect('/groups/create?error=internal')
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}
