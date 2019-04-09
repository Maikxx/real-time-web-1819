import express from 'express'
import helmet from 'helmet'
import path from 'path'
import socketIO from 'socket.io'
import http from 'http'
import compression from 'compression'
import { getIndexRoute } from './routes/indexRoute'
// import bodyParser from 'body-parser'

(async() => {
    const app = express()
    const server = new http.Server(app)
    // const urlencodedParser = bodyParser.urlencoded({ extended: false })
    const socketio = socketIO(server)

    app.use(helmet())
    app.use(compression())
    app.use(express.static(path.join(__dirname, '../public')))

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, 'views'))

    app.get('/', getIndexRoute)

    socketio.on('connection', (socket: SocketIO.Socket) => {
        socket.on('test', (data: any) => {
            socketio.emit('test', data)
        })
    })

    server.listen(({ port: process.env.PORT || 3000 }), () => {
        console.info(`App is now open for action on port ${process.env.PORT || 3000}.`)
    })
})()
