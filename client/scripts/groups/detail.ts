import 'babel-polyfill'
import io from 'socket.io-client'

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
            changeBetForm.addEventListener('change', onChangeChangeBetForm(socket))
        } else {
            throw new Error('The group input could not be found!')
        }
    }

    function onChangeChangeBetForm(socket: SocketIOClient.Socket) {
        return function(event: Event) {
            console.log(event)
        }
    }
})()
