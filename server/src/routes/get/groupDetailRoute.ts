import express from 'express'
import { database } from '../../database/setupDatabase'
import { User } from '../../types/User'

interface GroupDetailRouteParams {
    id: string
}

export async function getGroupDetailRoute(request: express.Request, response: express.Response) {
    const { id } = request.params as GroupDetailRouteParams

    if (request.isAuthenticated()) {
        if (!isNaN(Number(id))) {
            const user: User = request.user && request.user[0]
            const groupId = Number(id)

            if (!user) {
                console.error('User not found when trying to access the detail group route.')
                request.logout()
                return response.redirect('/login?error=authentication')
            }

            try {
                const { rows: groups } = await database.query(
                    `SELECT
                        groups.name,
                        crypto_currencies.name AS crypto_currency
                    FROM groups
                    LEFT JOIN crypto_currencies
                        ON (groups.crypto_currency = crypto_currencies._id)
                    WHERE groups._id = $1;`,
                    [groupId]
                )

                if (groups && groups.length > 0) {
                    const [group] = groups

                    const { rows: groupParticipants } = await database.query(
                        `SELECT
                            group_participants._id AS participant_id,
                            group_participants.score,
                            group_participants.bet,
                            users.username,
                            users._id AS user_id
                        FROM group_participants
                        LEFT JOIN users
                            ON (users._id = group_participants.user_id)
                        WHERE group_participants.group_id = $1
                        ORDER BY users.username ASC;`,
                        [groupId]
                    )

                    response.status(200).render('view/groups/detail', {
                        groupId: groupId,
                        groupName: group.name,
                        cryptoCurrency: group.crypto_currency,
                        groupParticipants,
                        currentUserId: user._id,
                    })
                } else {
                    console.error('The group you were looking for could not be found.')
                    response.status(404).redirect('/groups/list?error=not-found')
                }
            } catch (error) {
                console.error(error.message)
                response.status(500).redirect('/groups/list?error=internal')
            }
        } else {
            console.error('It looks like have passed a wrong ID in the url!')
            response.status(409).redirect('/groups/list?error=validation')
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}
