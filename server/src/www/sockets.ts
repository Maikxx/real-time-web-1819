import { Server } from 'http'
import { PollType } from '../types/Poll'
import { setupPolling, onPollResult } from '../www/poll'
import socket from 'socket.io'

export function setupSockets(server: Server) {
    const socketio: socket.Server = socket(server)
    const poll = setupPolling(false)

    poll.run()
    socketio.on('connection', onSocketConnection(poll))
}

function onSocketConnection(poll: PollType) {
    return function(socket: socket.Socket) {
        console.info('A user connected')

        poll.on('result', onPollResult(socket))
    }
}
