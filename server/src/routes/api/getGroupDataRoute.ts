import express from 'express'
import { database } from '../../database/setupDatabase'

export async function getGroupDataRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        try {
            const { id } = request.params as { id: string }

            if (!isNaN(Number(id))) {
                const groupId = Number(id)
                const { rows: groups } = await database.query(
                    `SELECT
                        groups._id,
                        groups.name,
                        crypto_currencies.name AS crypto_currency
                    FROM groups
                    LEFT JOIN crypto_currencies
                        ON (crypto_currencies._id = groups.crypto_currency)
                    WHERE groups._id = $1;`,
                    [groupId]
                )

                if (groups && groups.length > 0) {
                    const { rows: groupUsers } = await database.query(
                        `SELECT
                            group_participants.group_id,
                            users._id AS user_id,
                            users.username
                        FROM group_participants
                        LEFT JOIN users
                            ON (group_participants.user_id = users._id)
                        WHERE group_participants.group_id = $1
                        ORDER BY username ASC;
                        `,
                        [groupId]
                    )

                    response.status(200).json({
                        error: null,
                        group: {
                            ...groups[0],
                            participants: groupUsers,
                        },
                    })
                } else {
                    console.error('No group could be found with that identifier!')
                    response.status(500).json({
                        error: 'No group could be found with that identifier!',
                        group: null,
                    })
                }
            } else {
                console.error('You passed an invalid identifier as a parameter!')
                response.status(404).json({
                    error: 'You passed an invalid identifier as a parameter!',
                    group: null,
                })
            }
        } catch (error) {
            console.error(error.message)
            response.status(500).json({
                error: 'Something went wrong internally, please try again.',
                group: null,
            })
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).json({
            error: 'It looks like you are not logged in!',
            group: null,
        })
    }
}
