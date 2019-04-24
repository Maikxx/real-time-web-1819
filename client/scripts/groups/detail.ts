import 'babel-polyfill'
import SocketIO from 'socket.io-client'
import toast from 'toastr'
import { ChangeBetData, BetType, GroupParticipant } from '../types/Group'

; (() => {
    if (SocketIO) {
        if (!isNaN(getGroupIdFromWindow())) {
            setupSockets()
        } else {
            toast.error('Invalid group id is being passed to the server.')
        }
    } else {
        toast.error('Sockets could not be loaded for some reason!')
    }

    function connect(nameSpace: string) {
        return SocketIO.connect(nameSpace, {
            query: `ns=${nameSpace}`,
        })
    }

    function onSocketConnection(socket: SocketIO.Socket) {
        const { pathname } = window.location
        const groupId = Number(pathname[pathname.lastIndexOf('/') + 1])

        socket.on('bet-change-validated-on-server', onBetChangeValidated)
        socket.on('effort-change-validated-on-server', onEffortChangeValidated)
        socket.on('group-participants-changed', onGroupParticipantChanged)
        socket.on('new-participant-added', onNewParticipantAdded)
        socket.emit('subscribe-to-group', {
            id: groupId,
        })
        setupFormEventListeners(socket)
    }

    function setupSockets() {
        const groupId = getGroupIdFromWindow()
        const sockets: any = connect(`/groups/${groupId}`)

        sockets.on('connect', () => onSocketConnection(sockets))
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

    interface NewParticipantAddedParams {
        participant: {
            username: string
            _id: number
        }
        groupId: number
    }

    function onNewParticipantAdded(params: NewParticipantAddedParams) {
        const { pathname } = window.location
        const groupId = Number(pathname[pathname.lastIndexOf('/') + 1])
        const { groupId: validationGroupId, participant } = params

        if (validationGroupId === Number(groupId)) {
            const tableBody = document.querySelector('.Table__body')

            if (tableBody) {
                const tableRows = tableBody.querySelectorAll('tr')

                if (tableRows && tableRows.length > 0) {
                    // tslint:disable-next-line:ter-max-len
                    const existingUserRow = Array.from(tableRows).find(tableRow => Number(tableRow.getAttribute('data-participant-id')) === participant._id)

                    if (!existingUserRow) {
                        tableBody.innerHTML += `
                            <tr class="Table__row" data-participant-id="${participant._id}">
                                <td class="Table__cell">
                                    ${participant.username}
                                </td>
                                <td class="Table__cell TableCell--bet" data-participant-id="${participant._id}">
                                    No bet placed yet
                                </td>
                                <td class="Table__cell TableCell--effort" data-participant-id="${participant._id}">
                                    Effort has not been placed yet
                                </td>
                                <td class="Table__cell TableCell--score" data-participant-id="${participant._id}">
                                    0
                                </td>
                                <td class="Table__cell TableCell--hypothetical-gain" data-participant-id="${participant._id}">
                                    €0
                                </td>
                            </tr>
                        `
                    }
                }
            }
        }
    }

    function onGroupParticipantChanged(participants: GroupParticipant[]) {
        participants.forEach(participant => {
            const scoreElement = document.querySelector(`td[data-participant-id="${participant._id}"].TableCell--score`)
            const gainElement = document.querySelector(`td[data-participant-id="${participant._id}"].TableCell--hypothetical-gain`)

            if (scoreElement && gainElement) {
                const previousScoreValue = Number(scoreElement.innerHTML)
                const fluctuation = participant.score > previousScoreValue
                    ? 'UP'
                    : 'DOWN'

                animateTextColor(scoreElement, fluctuation, String(participant.score))
                animateTextColor(gainElement, fluctuation, `€${participant.hypothetical_gain}`)
            }
        })
    }

    function animateTextColor(element: Element, fluctuation: string, value: string) {
        (element as HTMLElement).style.setProperty('color', fluctuation === 'UP' ? 'green' : 'crimson')
        ; (element as HTMLElement).style.setProperty('transform', 'scale(1.5)')

        setTimeout(() => {
            (element as HTMLElement).innerText = value
        }, 0)
    }

    function onEffortChangeValidated(data: EffortChangeClientData) {
        const { participantId, effort } = data
        const tableDataElements = document.querySelectorAll(`td[data-participant-id].TableCell--effort`)

        if (tableDataElements && tableDataElements.length > 0) {
            const effortElementToUpdate = Array.from(tableDataElements).find(element => {
                const children = Array.from(element.childNodes)
                const dataParticipantId = element.getAttribute('data-participant-id')

                return !!dataParticipantId
                    && Number(dataParticipantId) === participantId
                    && !children.find(child => child.nodeName === 'FORM')
            })

            if (effortElementToUpdate) {
                (effortElementToUpdate as HTMLTableDataCellElement).innerText = `€${String(effort)}`
            }
        }
    }

    function onBetChangeValidated(data: BetChangeClientData) {
        const { participantId, newBet } = data
        const tableDataElements = document.querySelectorAll(`td[data-participant-id].TableCell--bet`)

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

    function setupFormEventListeners(socket: SocketIO.Socket) {
        const changeBetForm: HTMLFormElement | null = document.querySelector('.Form')
        const changeEffortForm: Element | null = document.querySelectorAll('.Form')[1]

        if (changeBetForm) {
            changeBetForm.addEventListener('change', onChangeChangeBetForm(socket, changeBetForm))
        } else {
            toast.error('The change bet input could not be found!')
        }

        if (changeEffortForm) {
            changeEffortForm.addEventListener('change', onChangeEffortForm(socket, changeEffortForm))
        } else {
            toast.error('The change effort input could not be found!')
        }
    }

    function onChangeEffortForm(socket: SocketIO.Socket, form: Element) {
        return async function(event: Event) {
            event.preventDefault()
            const { target } = event

            if (target) {
                const formAction = form.getAttribute('action')
                const participantId = form.getAttribute('data-participant-id')

                if (formAction && participantId) {
                    const url = `${window.location.origin}/api/${formAction}`
                    const value = Number((target as HTMLSelectElement).value)

                    if (value && value > 0 && value <= 50) {
                        const response = await fetch(url, {
                            body: JSON.stringify({ effort: value }),
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })

                        const data: ChangeBetData = await response.json()

                        if (data && data.success && !data.error) {
                            socket.emit('effort-changed-on-client', {
                                groupId: getGroupIdFromWindow(),
                                participantId: Number(participantId),
                                effort: value,
                            })
                        } else if (data.error) {
                            toast.error(data.error)
                        }
                    } else {
                        toast.error('You did not seem to have passed the correct data to the server.')
                    }
                } else {
                    toast.error('You did not seem to have passed the correct data to the server.')
                }
            } else {
                toast.error('The input could not be gathered from the event.')
            }
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
                            toast.error(data.error)
                        }
                    } else {
                        toast.error('You did not seem to have passed the correct data to the server.')
                    }
                }
            } else {
                toast.error('The input could not be gathered from the event.')
            }
        }
    }

    function getGroupIdFromWindow() {
        const { href } = window.location
        return Number(href.slice(href.lastIndexOf('/') + 1))
    }
})()
