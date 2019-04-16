import 'babel-polyfill'
import io from 'socket.io-client'
import { ChangeBetData, BetType } from '../types/Group'

(() => {
    if (io) {
        if (!isNaN(getGroupIdFromWindow())) {
            setupSockets()
        } else {
            throw new Error('Invalid group id is being passed to the server.')
        }
    } else {
        throw new Error('Sockets could not be loaded for some reason!')
    }

    function connect(nameSpace: string) {
        return io.connect(nameSpace, {
            query: `ns=${nameSpace}`,
        })
    }

    interface BetChangeClientData {
        groupId: number
        participantId: number
        newBet: BetType
    }

    function onSocketConnection(socket: SocketIO.Socket) {
        socket.on('bet-change-validated-on-server', onBetChangeValidated)
        setupFormEventListener(socket)
    }

    function onBetChangeValidated(data: BetChangeClientData) {
        const { participantId, newBet } = data
        const tableDataElements = document.querySelectorAll(`td[data-participant-id]`)

        if (tableDataElements && tableDataElements.length > 0) {
            const bettingElementToUpdate = Array.from(tableDataElements).find(element => {
                const children = Array.from(element.childNodes)
                const dataParticipantId = element.getAttribute('data-participant-id')

                return !!dataParticipantId
                    && Number(dataParticipantId) === participantId
                    && !children.find(child => child.nodeName === 'FORM')
            })

            if (bettingElementToUpdate) {
                (bettingElementToUpdate as HTMLTableDataCellElement).innerText = newBet === 'HIGH'
                    ? 'High'
                    : 'Low'
            }
        }
    }

    function setupSockets() {
        const groupId = getGroupIdFromWindow()
        const socketio: any = connect(`/groups/${groupId}`)

        socketio.on('connect', () => onSocketConnection(socketio))
    }

    function setupFormEventListener(socket: SocketIO.Socket) {
        const changeBetForm: HTMLFormElement | null = document.querySelector('.Form')

        if (changeBetForm) {
            changeBetForm.addEventListener('change', onChangeChangeBetForm(socket, changeBetForm))
        } else {
            throw new Error('The group input could not be found!')
        }
    }

    function onChangeChangeBetForm(socket: SocketIO.Socket, form: HTMLFormElement) {
        return async function(event: Event) {
            event.preventDefault()
            const { target } = event

            if (target) {
                const formAction = form.getAttribute('action')
                const participantId = form.getAttribute('data-participant-id')

                if (formAction && participantId) {
                    const url = `${window.location.origin}/api/${formAction}`
                    const value = (target as HTMLSelectElement).value

                    if (value) {
                        const response = await fetch(url, {
                            body: JSON.stringify({ newBet: value }),
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        const data: ChangeBetData = await response.json()

                        if (data && data.success && !data.error) {
                            socket.emit('bet-changed-on-client', {
                                groupId: getGroupIdFromWindow(),
                                participantId: Number(participantId),
                                newBet: value,
                            })
                        } else if (data.error) {
                            throw new Error(data.error)
                        }
                    } else {
                        throw new Error('You did not seem to have passed the correct data to the server.')
                    }
                }
            } else {
                throw new Error('The input could not be gathered from the event.')
            }
        }
    }

    function getGroupIdFromWindow() {
        const { href } = window.location
        return Number(href.slice(href.lastIndexOf('/') + 1))
    }
})()
