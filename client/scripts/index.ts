import io from 'socket.io-client'

const socket = io()

socket.emit('test')
socket.on('test', () => {
    console.log('Success')
})
