import express from 'express'
import { database } from '../../database/setupDatabase'
import { User } from '../../types/User'

export async function postJoinGroupRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        const user: User = request.user && request.user[0]
        const { groupId } = request.body as { groupId?: string }

        if (!user) {
            console.error('It looks like you are not logged in!')
            request.logout()
            response.status(403).redirect('/login?error=authentication')
        }

        if (groupId && groupId.length > 0 && !isNaN(Number(groupId))) {
            const id: number = Number(groupId)

            try {
                const { rows: groupParticipantRows } = await database.query(
                    `INSERT INTO group_participants (
                        user_id,
                        group_id
                    ) VALUES (
                        $1, $2
                    ) RETURNING group_id;`,
                    [ user._id, id ]
                )

                if (groupParticipantRows && groupParticipantRows.length > 0) {
                    response.status(200).redirect(`/groups/${id}`)
                } else {
                    console.error('It looks like the database did not sent back any group participants!')
                    response.status(500).redirect('/groups/join?error=internal')
                }
            } catch (error) {
                console.error(error.message)
                response.status(500).redirect('/groups/join?error=internal')
            }
        } else {
            console.error('It looks like you passed a non valid groupId to us!')
            response.status(409).redirect('/groups/join?error=validation')
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}
