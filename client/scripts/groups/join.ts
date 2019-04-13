import 'babel-polyfill'
import io from 'socket.io-client'
import { GroupQueryResult } from '../types/Group'

(() => {
    if (io) {
        const socket: SocketIOClient.Socket = io()

        socket.on('connect', () => onSocketConnection(socket))
    } else {
        throw new Error('Sockets could not be loaded for some reason!')
    }

    function onSocketConnection(socket: SocketIOClient.Socket) {
        const groupInput: HTMLSelectElement | null = document.querySelector('[name="groupId"]')

        if (groupInput) {
            groupInput.addEventListener('change', onChangeGroupInput(socket))
        } else {
            throw new Error('The group input could not be found!')
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

                        if (data && !data.error) {
                            const { group } = data

                            const dynamicHTML = `
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
                                            // tslint:disable-next-line:ter-max-len
                                            ? `<ul class="Row Row--wrap">${group.participants.map(participant => `<li>${participant.username}</li>`)}</ul>`
                                            : 'No participants found for this group.'
                                        }
                                    </div>
                                </div>
                            `

                            JS_DYNAMIC_HTML_HOOK.innerHTML = dynamicHTML
                        } else {
                            throw new Error(data.error as string)
                        }
                    } catch (error) {
                        throw new Error(error.message)
                    }
                } else {
                    throw new Error('It looks like you tried to hack the system here!')
                }
            } else {
                throw new Error('One of the required elements could not be found!')
            }
        }
    }
})()
