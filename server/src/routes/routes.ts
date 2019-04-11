import express from 'express'
import bcrypt from 'bcrypt'

import { CryptoCurrency } from '../types/CryptoCurrency'
import { getAllCryptoCurrencies } from '../database/crypto_currencies/getAllCryptoCurrencies'
import { database } from '../database/setupDatabase'

export function getIndexRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/index')
}

export function getLoginRoute(request: express.Request, response: express.Response) {
    console.log(request.user)

    if (request.isAuthenticated()) {
        response.redirect('/dashboard')
    } else {
        response.status(200).render('view/login')
    }
}

export function getSignUpRoute(request: express.Request, response: express.Response) {
    console.log(request.user)

    response.status(200).render('view/signup')
}

export function getDashboardRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/dashboard')
}

export function getGroupListRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/groups/list')
}

export function getGroupJoinRoute(request: express.Request, response: express.Response) {
    response.status(200).render('view/groups/join')
}

interface GroupDetailRouteParams {
    id: string
}

export function getGroupDetailRoute(request: express.Request, response: express.Response) {
    const { id } = request.params as GroupDetailRouteParams

    response.status(200).render('view/groups/detail', {
        id,
    })
}

export async function getGroupCreateRoute(request: express.Request, response: express.Response) {
    try {
        const cryptoCurrencies: CryptoCurrency[] = await getAllCryptoCurrencies()

        response.status(200).render('view/groups/create', {
            cryptoCurrencies,
        })
    } catch (error) {
        console.error(error.message)
        response.status(500).redirect('/')
    }
}

interface SignUpArgs {
    email: string
    password: string
    name: string
    'repeat-password': string
}

export async function postSignUpRoute(request: express.Request, response: express.Response) {
    const { email, password: rawPassword, name, 'repeat-password': repeatPassword } = request.body as SignUpArgs

    try {
        if (rawPassword !== repeatPassword) {
            throw new Error('Password do not match')
        }

        const password = await bcrypt.hash(rawPassword, 5)

        const { rows } = await database.query('SELECT _id FROM users WHERE email = $1', [email])

        if (rows && rows.length > 0) {
            console.error('This user is already registered')
            response.redirect('/signup')
        } else {
            database.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [ name, email, password ])
            response.redirect('/login')
        }
    } catch (error) {
        console.error(error.message)
        response.redirect('/')
    }
}

export function postLoginRoute(request: express.Request, response: express.Response) {
    if (request.session) {
        request.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
    }

    response.redirect('/dashboard')
}
