import express from 'express'

export function getSignUpRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/signup')
}
