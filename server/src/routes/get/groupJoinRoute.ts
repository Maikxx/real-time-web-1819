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
            const { rows: groupParticipants } = await database.query(
                `SELECT
                    user_id,
                    group_id
                FROM group_participants;`
            )

            if (groupParticipants && groupParticipants.length > 0) {
                const notAllowedGroups = groupParticipants
                    .filter(groupParticipant => groupParticipant.user_id === userId)
                    .map(groupParticipant => groupParticipant.group_id)

                const { rows: groups } = await database.query(
                    `SELECT
                        _id,
                        name,
                        crypto_currency
                    FROM groups
                    ${notAllowedGroups && notAllowedGroups.length > 0
                        ? 'WHERE _id != ALL($1::INTEGER[])'
                        : ''
                    }
                    ORDER BY name ASC;`,
                    notAllowedGroups && notAllowedGroups.length > 0
                        ? [`{${notAllowedGroups.join(',')}}`]
                        : []
                )

                response.status(200).render('view/groups/join', {
                    groups,
                    error: null,
                })
            } else {
                console.error('There are no groups that you can join!')
                response.status(409).render('view/groups/join', {
                    groups: [],
                    error: 'There could be no groups found for you to join.',
                })
            }
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
