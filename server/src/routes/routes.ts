import express from 'express'
import bcrypt from 'bcrypt'

import { CryptoCurrency } from '../types/CryptoCurrency'
import { getAllCryptoCurrencies } from '../database/crypto_currencies/getAllCryptoCurrencies'
import { database } from '../database/setupDatabase'
import { User, UserSignUpArgs } from '../types/User'

export function getIndexRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        response.redirect('/dashboard')
    } else {
        response.redirect('/login')
    }
}

export function getLoginRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        response.redirect('/dashboard')
    } else {
        response.status(200).render('view/login')
    }
}

export function getSignUpRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        response.redirect('/dashboard')
    } else {
        response.status(200).render('view/signup')
    }
}

export function getDashboardRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        const user: User = request.user && request.user[0]

        if (!user) {
            console.error('User not found when trying to access the dashboard route.')
            request.logout()
            return response.redirect('/login')
        }

        response.status(200).render('view/dashboard', {
            user,
        })
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}

export async function getGroupCreateRoute(request: express.Request, response: express.Response) {
    if (request.isAuthenticated()) {
        try {
            const cryptoCurrencies: CryptoCurrency[] = await getAllCryptoCurrencies()

            response.status(200).render('view/groups/create', {
                cryptoCurrencies,
            })
        } catch (error) {
            console.error(error.message)
            response.status(500).redirect('/?error=internal')
        }
    } else {
        console.error('It looks like you are not logged in!')
        response.status(403).redirect('/login?error=authentication')
    }
}

export async function postSignUpRoute(request: express.Request, response: express.Response) {
    const { email, password: rawPassword, name, 'repeat-password': repeatPassword } = request.body as UserSignUpArgs

    try {
        if (rawPassword !== repeatPassword) {
            throw new Error('Password do not match')
        }

        const password = await bcrypt.hash(rawPassword, 5)
        const { rows } = await database.query('SELECT _id FROM users WHERE email = $1;', [email])

        if (rows && rows.length > 0) {
            console.error('This user is already registered')
            response.redirect('/signup')
        } else {
            await database.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3);', [ name, email, password ])
            response.redirect('/login')
        }
    } catch (error) {
        console.error(error.message)
        response.redirect('/?error=internal')
    }
}

export function postLoginRoute(request: express.Request, response: express.Response) {
    response.redirect('/dashboard')
}

export function postLogOutRoute(request: express.Request, response: express.Response) {
    request.logout()
    response.redirect('/login')
}
