import express from 'express'

export function getLoginRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/login')
}