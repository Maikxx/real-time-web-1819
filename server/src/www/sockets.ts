import { Server } from 'http'
import url from 'url'
import socket from 'socket.io'
import { BetType } from '../types/CryptoCurrency'

const socketRoutes = {
    'groups.detail': '^\\/groups\\/(\\d+)$',
}

interface SocketIOQueryParams {
    ns?: string
}

export function setupSockets(server: Server) {
    const socketio: socket.Server = socket(server)
    // const poll = setupPolling(false)

    // poll.run()
    socketio.on('connection', onSocketConnection(socketio))
    return socketio
}

interface BetChangeClientData {
    groupId: number
    participantId: number
    newBet: BetType
}

function onSocketConnection(socketIo: SocketIO.Server) {
    return function(socket: socket.Socket) {
        const queryParams: SocketIOQueryParams = url.parse(socket.handshake.url, true).query
        const nameSpace = queryParams.ns

        if (nameSpace) {
            // tslint:disable-next-line:forin
            for (const routeName in socketRoutes) {
                const routeRegExpression = socketRoutes[routeName]

                if (nameSpace.match(routeRegExpression)) {
                    const socketNameSpace = socketIo.of(nameSpace)

                    socketNameSpace.on('connection', socket => {
                        const nameSpaceGroupId = Number(nameSpace[nameSpace.lastIndexOf('/') + 1])

                        socket.on('bet-changed-on-client', (data: BetChangeClientData) => {
                            if (data.groupId === nameSpaceGroupId) {
                                socketNameSpace.emit('bet-change-validated-on-server', data)
                            }
                        })
                    })

                    break
                }
            }
        }

        console.info('A user connected')

        // poll.on('result', onPollResult(socket))
    }
}
