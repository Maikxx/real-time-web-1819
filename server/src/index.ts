import express from 'express'
import helmet from 'helmet'
import path from 'path'
import http from 'http'
import compression from 'compression'
import { getIndexRoute } from './routes/indexRoute'
import { setupSockets } from './www/sockets'

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

    server.listen(({ port: process.env.PORT || 3000 }), () => {
        console.info(`App is now open for action on port ${process.env.PORT || 3000}.`)
    })
})()
