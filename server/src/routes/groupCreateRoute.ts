import express from 'express'

export function getGroupCreateRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/groups/create')
}