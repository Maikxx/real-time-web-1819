require('dotenv').config()
import express from 'express'
import helmet from 'helmet'
import path from 'path'
import http from 'http'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import passportLocal from 'passport-local'
import passport from 'passport'
import expressSession from 'express-session'
import bcrypt from 'bcrypt'

import { setupDatabase, database } from './database/setupDatabase'
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
} from './routes/routes'

const EXPRESS_SESSION_SECRET = process.env.EXPRESS_SESSION_SECRET
const LocalStrategy = passportLocal.Strategy

; (async () => {
    if (!EXPRESS_SESSION_SECRET) {
        throw new Error('You don\'t seem to have passed the session secret key correctly.')
    }

    await setupDatabase()
    const app = express()
    const server = new http.Server(app)
    setupSockets(server)

    app.use(helmet())
    app.use(compression())
    app.use(cookieParser())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(expressSession({ secret: EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: true }))
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

    server.listen(({ port: process.env.PORT || 3000 }), () => {
        console.info(`App is now open for action on port ${process.env.PORT || 3000}.`)
    })
})()

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email: string, password: string, done: Function) => {
    (async () => {
        try {
            const { rows } = await database.query('SELECT * FROM users WHERE email = $1;', [email])

            if (!rows || rows.length === 0) {
                return done(null, false)
            } else {
                const passwordsDoMatch = await bcrypt.compare(password, rows[0].password)

                if (passwordsDoMatch) {
                    return done(null, [rows[0]])
                }
            }
        } catch (error) {
            console.error(error.message)
            return done(error)
        }
    })()
}))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})
