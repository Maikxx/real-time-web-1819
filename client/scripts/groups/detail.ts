import 'babel-polyfill'
import io from 'socket.io-client'
import { ChangeBetData } from '../types/Group'

(() => {
    if (io) {
        const socket: SocketIOClient.Socket = io()

        socket.on('connect', () => onSocketConnection(socket))
    } else {
        throw new Error('Sockets could not be loaded for some reason!')
    }

    function onSocketConnection(socket: SocketIOClient.Socket) {
        const changeBetForm: HTMLFormElement | null = document.querySelector('.Form')

        if (changeBetForm) {
            changeBetForm.addEventListener('change', onChangeChangeBetForm(socket, changeBetForm))
        } else {
            throw new Error('The group input could not be found!')
        }
    }

    function onChangeChangeBetForm(socket: SocketIOClient.Socket, form: HTMLFormElement) {
        return async function(event: Event) {
            const { target } = event

            if (target) {
                const formAction = form.getAttribute('action')

                if (formAction) {
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
                            console.log('Hey')
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
})()
