import { Server } from 'http'
import url from 'url'
import SocketIO from 'socket.io'
import { BetType } from '../types/CryptoCurrency'
import { groupCreationEmitter, groupParticipantCreationEmitter, groupScoreChanged } from './events'
import { Group } from '../types/Group'
import { setupPolling } from './poll'

const socketRoutes = {
    'groups/detail': '^\\/groups\\/(\\d+)$',
    join: '^\\/join$',
}

interface SocketIOQueryParams {
    ns?: string
}

export async function setupSockets(server: Server) {
    const sockets: SocketIO.Server = SocketIO(server)
    const poll = await setupPolling(false)

    if (poll) {
        (poll as any).run()
    }

    sockets.on('connection', onSocketConnection(sockets))
    return sockets
}

interface BetChangeClientData {
    groupId: number
    participantId: number
    newBet: BetType
}

interface EffortChangeClientData {
    groupId: number
    participantId: number
    effort: number
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
                        if (routeName === 'groups/detail') {
                            onGroupDetailConnection(socket, socketNameSpace, nameSpace)
                        } else if (routeName === 'join') {
                            onJoinConnection(socket, socketNameSpace)
                        }
                    })

                    break
                }
            }
        }

        console.info('A user connected!')
    }
}

function onGroupDetailConnection(socket: SocketIO.Socket, socketNameSpace: SocketIO.Namespace, nameSpace: string) {
    const nameSpaceGroupId = Number(nameSpace[nameSpace.lastIndexOf('/') + 1])

    socket.on('bet-changed-on-client', (data: BetChangeClientData) => {
        if (data.groupId === nameSpaceGroupId) {
            socketNameSpace.emit('bet-change-validated-on-server', data)
        }
    })

    groupScoreChanged.on(`group-${nameSpaceGroupId}-changed`, data => {
        socketNameSpace.emit('group-participants-changed', data)
    })

    socket.on('subscribe-to-group', (group: { id: number }) => {
        groupParticipantCreationEmitter.on(`new-group-participant-added-to-group-${group.id}`, onNewGroupParticipantAdded(socketNameSpace, group.id))
    })

    socket.on('effort-changed-on-client', (data: EffortChangeClientData) => {
        if (data.groupId === nameSpaceGroupId) {
            socketNameSpace.emit('effort-change-validated-on-server', data)
        }
    })
}

function onJoinConnection(socket: SocketIO.Socket, socketNameSpace: SocketIO.Namespace) {
    groupCreationEmitter.on('group-created', (createdGroup: Group) => {
        socketNameSpace.emit('new-group-added', createdGroup)
    })

    socket.on('subscribe-to-group', (group: { id: number }) => {
        groupParticipantCreationEmitter.on(`new-group-participant-added-to-group-${group.id}`, onNewGroupParticipantAdded(socketNameSpace, group.id))
    })
}

function onNewGroupParticipantAdded(socketNameSpace: SocketIO.Namespace, groupId: number) {
    return function(participant: { username: string, _id: number }) {
        socketNameSpace.emit('new-participant-added', {
            participant,
            groupId,
        })
    }
}
