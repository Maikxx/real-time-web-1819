require('dotenv').config()
import express from 'express'

export function getIndexRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/index', {})
}
