import express from 'express'

export function getGroupListRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/groups/list')
}
