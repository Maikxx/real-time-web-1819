require('dotenv').config()
import express from 'express'
import helmet from 'helmet'
import path from 'path'
import http from 'http'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import passport from 'passport'
import expressSession from 'express-session'
import pgConnect from 'connect-pg-simple'

const pgSession = pgConnect(expressSession)

import { setupDatabase } from './database/setupDatabase'
import { setupSockets } from './www/sockets'
import {
    getIndexRoute,
    getLoginRoute,
    getSignUpRoute,
    getDashboardRoute,
    getGroupJoinRoute,
    getGroupCreateRoute,
    getGroupListRoute,
    getGroupDetailRoute,
    postSignUpRoute,
    postLoginRoute,
    postLogOutRoute,
} from './routes/routes'
import { postCreateGroupRoute } from './routes/post/createGroupRoute'
import { setupAuth } from './auth/setupAuth'

const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET

; (async () => {
    if (!EXPRESS_SESSION_SECRET) {
        throw new Error('You don\'t seem to have passed the session secret key correctly.')
    }

    const BASE_SESSION_VARIABLES = {
        secret: EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    }

    const SESSION_VARIABLES = process.env.NODE_ENV === 'production'
        ? {
            ...BASE_SESSION_VARIABLES,
            store: new pgSession({
                conString: process.env.DATABASE_URL,
            }),
        }
        : BASE_SESSION_VARIABLES

    const app = express()
    const server = new http.Server(app)

    await setupDatabase()
    setupSockets(server)
    setupAuth(passport)

    app.use(helmet())
    app.use(compression())
    app.use(cookieParser())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(expressSession(SESSION_VARIABLES))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(express.static(path.join(__dirname, '../public')))

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, 'views'))

    app.get('/', getIndexRoute)
    app.get('/login', getLoginRoute)
    app.get('/signup', getSignUpRoute)
    app.get('/dashboard', getDashboardRoute)
    app.get('/groups/join', getGroupJoinRoute)
    app.get('/groups/create', getGroupCreateRoute)
    app.get('/groups/list', getGroupListRoute)
    app.get('/groups/:id', getGroupDetailRoute)

    app.post('/signup', postSignUpRoute)
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true,
    }), postLoginRoute)
    app.post('/logout', postLogOutRoute)

    app.post('/groups/create', postCreateGroupRoute)

    server.listen(({ port: process.env.PORT || 3000 }), () => {
        console.info(`App is now open for action on port ${process.env.PORT || 3000}.`)
    })
})()
