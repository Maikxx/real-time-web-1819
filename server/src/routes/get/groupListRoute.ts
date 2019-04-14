import express from 'express'
import { User } from '../../types/User'
import { database } from '../../database/setupDatabase'

export async function getGroupListRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        const user: User = request.user && request.user[0]

        if (!user) {
            console.error('User not found when trying to access the list group route.')
            request.logout()
            return response.redirect('/login?error=authentication')
        }

        const { _id: userId } = user
        const { rows: groupParticipants } = await database.query(
            `SELECT
                group_id
            FROM group_participants
            WHERE user_id = $1;`,
            [userId]
        )

        if (groupParticipants && groupParticipants.length > 0) {
            const { rows: groups } = await database.query(
                `SELECT
                    _id,
                    name
                FROM groups
                WHERE _id = ANY($1::INTEGER[])
                ORDER BY name ASC;`,
                [`{${groupParticipants.map(participant => participant.group_id).join(', ')}}`]
            )

            response.status(200).render('view/groups/list', {
                groups,
                error: null,
            })
        } else {
            console.error('There are no groups that you have joined!')
            response.status(409).render('view/groups/list', {
                groups: [],
                error: 'There are no groups found, which you have joined.',
            })
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}
