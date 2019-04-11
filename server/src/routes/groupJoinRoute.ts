import express from 'express'

export function getGroupJoinRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/groups/join')
}
