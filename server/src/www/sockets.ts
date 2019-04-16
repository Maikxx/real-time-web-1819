import { Server } from 'http'
import url from 'url'
import SocketIO from 'socket.io'
import { BetType } from '../types/CryptoCurrency'

const socketRoutes = {
    'groups.detail': '^\\/groups\\/(\\d+)$',
}

interface SocketIOQueryParams {
    ns?: string
}

export function setupSockets(server: Server) {
    const sockets: SocketIO.Server = SocketIO(server)
    // const poll = setupPolling(false)

    // poll.run()
    sockets.on('connection', onSocketConnection(sockets))
    return sockets
}

interface BetChangeClientData {
    groupId: number
    participantId: number
    newBet: BetType
}

function onSocketConnection(sockets: SocketIO.Server) {
    return function(socket: SocketIO.Socket) {
        const queryParams: SocketIOQueryParams = url.parse(socket.handshake.url, true).query
        const nameSpace = queryParams.ns

        if (nameSpace) {
            // tslint:disable-next-line:forin
            for (const routeName in socketRoutes) {
                const routeRegExpression = socketRoutes[routeName]

                if (nameSpace.match(routeRegExpression)) {
                    const socketNameSpace = sockets.of(nameSpace)

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
