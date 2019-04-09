import { Server } from 'http'
import { PollType } from '../../../shared/types/Poll'
import { setupPolling, onPollResult } from '../www/poll'
import { State } from '../services/State'
import socket from 'socket.io'

export function setupSockets(server: Server) {
    const socketio: socket.Server = socket(server)
    const poll = setupPolling(false)
    const state = new State({ })

    poll.run()
    socketio.on('connection', onSocketConnection(poll, state))
}

function onSocketConnection(poll: PollType, state: State) {
    return function(socket: socket.Socket) {
        console.info('A user connected')

        poll.on('result', onPollResult(socket, state))
    }
}
