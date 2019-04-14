import express from 'express'
import { User } from '../../types/User'
import { database } from '../../database/setupDatabase'

export async function getGroupJoinRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        const user: User = request.user && request.user[0]

        if (!user) {
            console.error('User not found when trying to access the join group route.')
            request.logout()
            return response.redirect('/login?error=authentication')
        }

        const { _id: userId } = user

        try {
            const { rows: groups } = await database.query(
                `SELECT *
                FROM groups
                LEFT JOIN group_participants
                    ON (groups._id = group_participants.group_id)
                WHERE group_participants.user_id != ANY($1::INTEGER[])
                ORDER BY name ASC;
                `,
                [`{${userId}}`]
            )

            response.status(200).render('view/groups/join', {
                groups,
                error: null,
            })
        } catch (error) {
            console.error(error.message)
            response.status(500).render('view/groups/join', {
                groups: [],
                error: 'Internal server error',
            })
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}
