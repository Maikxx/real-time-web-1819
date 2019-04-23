import 'babel-polyfill'
import SocketIO from 'socket.io-client'
import toast from 'toastr'
import { GroupQueryResult, Group } from '../types/Group'

interface NewParticipantAddedParams {
    participant: {
        username: string
        _id: number
    }
    groupId: number
}

(() => {
    if (SocketIO) {
        setupSockets()
    } else {
        toast.error('Sockets could not be loaded for some reason!')
    }

    function setupSockets() {
        const socket: SocketIOClient.Socket = connect('/join')

        socket.on('connect', () => onSocketConnection(socket))
    }

    function connect(nameSpace: string) {
        return SocketIO.connect(nameSpace, {
            query: `ns=${nameSpace}`,
        })
    }

    function onSocketConnection(socket: SocketIOClient.Socket) {
        socket.on('new-group-added', onNewGroupAdded)
        setupFormEventListener(socket)
    }

    function onNewGroupAdded({ name, _id }: Group) {
        const groupInput = document.querySelector('select[name=groupId]')

        if (groupInput) {
            if (groupInput.innerHTML.includes(`value="${_id}"`)) {
                return
            }

            groupInput.innerHTML += `<option value="${_id}">${name}</option>`
        }
    }

    function setupFormEventListener(socket: SocketIOClient.Socket) {
        const groupInput: HTMLSelectElement | null = document.querySelector('[name="groupId"]')

        if (groupInput) {
            groupInput.addEventListener('change', onChangeGroupInput(socket))
        } else {
            toast.error('The group input could not be found!')
        }
    }

    function onChangeGroupInput(socket: SocketIOClient.Socket) {
        return async function(event: Event) {
            const { target: groupInput } = event
            const JS_DYNAMIC_HTML_HOOK = document.querySelector('.JS_DYNAMIC_HTML')

            if (groupInput && JS_DYNAMIC_HTML_HOOK) {
                const { value: groupId } = groupInput as HTMLSelectElement

                if (groupId && groupId.length > 0) {
                    const getGroupDataUrl = `${window.location.origin}/api/groups/${groupId}`

                    try {
                        const response = await fetch(getGroupDataUrl)
                        const data: GroupQueryResult = await response.json()

                        socket.emit('subscribe-to-group', {
                            id: data.group._id,
                        })

                        socket.on('new-participant-added', (params: NewParticipantAddedParams) => {
                            const { groupId: validationGroupId, participant } = params

                            if (validationGroupId === Number(groupId)) {
                                const userListElement = document.querySelector('#user-list')

                                if (userListElement && !userListElement.innerHTML.includes(`data-user-id="${params.participant._id}"`)) {
                                    userListElement.innerHTML += `<li data-user-id="${params.participant._id}">${participant.username}</li>`

                                    ; (userListElement as HTMLElement).style.color = 'green'

                                    setTimeout(() => {
                                        (userListElement as HTMLElement).style.color = '#000000'
                                    }, 300)
                                }
                            }
                        })

                        if (data && !data.error) {
                            JS_DYNAMIC_HTML_HOOK.innerHTML = getGroupDetailMarkup(data.group)
                        } else {
                            toast.error(data.error as string)
                        }
                    } catch (error) {
                        toast.error(error.message)
                    }
                } else {
                    toast.error('It looks like you tried to hack the system here!')
                }
            } else {
                toast.error('One of the required elements could not be found!')
            }
        }
    }

    function getGroupDetailMarkup(group: Group) {
        return `
        <div class="Field">
            <span class="Field__title">
                Group currency
            </span>
            <div class="Field__content">
                <span>${group.crypto_currency}</span>
            </div>
        </div>

        <div class="Field">
            <span class="Field__title">
                Users in this group
            </span>
            <div class="Field__content">
                ${group.participants && group.participants.length > 0
                    ? (
                        `<ul class="Row Row--wrap" id="user-list">
                            ${group.participants.map(participant => (
                                `<li>${participant.username}</li>`
                            ))}
                        </ul>`
                    )
                    : 'No participants found for this group.'
                }
            </div>
        </div>
    `
    }
})()
