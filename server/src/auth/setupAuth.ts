import passportLocal from 'passport-local'
import { PassportStatic } from 'passport'
import { database } from '../database/setupDatabase'
import bcrypt from 'bcrypt'

const LocalStrategy = passportLocal.Strategy

export async function setupAuth(passport: PassportStatic) {
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
}
