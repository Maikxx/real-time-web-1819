import express from 'express'

export function getDashboardRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/dashboard')
}