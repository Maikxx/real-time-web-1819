import express from 'express'
import helmet from 'helmet'
import path from 'path'
import http from 'http'
import compression from 'compression'
import { getIndexRoute } from './routes/indexRoute'
import { setupSockets } from './www/sockets'
import { getLoginRoute } from './routes/loginRoute'
import { getSignUpRoute } from './routes/signUpRoute'
import { getDashboardRoute } from './routes/dashboardRoute'
import { getGroupJoinRoute } from './routes/groupJoinRoute'
import { getGroupCreateRoute } from './routes/groupCreateRoute'

(async() => {
    const app = express()
    const server = new http.Server(app)
    setupSockets(server)

    app.use(helmet())
    app.use(compression())
    app.use(express.static(path.join(__dirname, '../public')))

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, 'views'))

    app.get('/', getIndexRoute)
    app.get('/login', getLoginRoute)
    app.get('/signup', getSignUpRoute)
    app.get('/dashboard', getDashboardRoute)
    app.get('/groups/join', getGroupJoinRoute)
    app.get('/groups/create', getGroupCreateRoute)

    server.listen(({ port: process.env.PORT || 3000 }), () => {
        console.info(`App is now open for action on port ${process.env.PORT || 3000}.`)
    })
})()
