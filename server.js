const path = require('path')
const dotenv = require('dotenv')
const http = require('http')
const express = require('express')
const SocketIO = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users')


dotenv.config()

const app = express()

const Server = http.createServer(app)
const io = SocketIO(Server)

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

const name = 'Mouhibot'

//Run when a client connects
io.on('connection', socket => {
    console.log('new Web Socket connection :>> ')

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        //welcome the current user
        socket.emit('message', formatMessage(name, 'welcome to chat'))

        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(name, `${user.username} has joined the chat`))

        //catch message sent from front end
        socket.on('chatMessage', (message) => {
            const user = getCurrentUser(socket.id)
            io.to(user.room).emit('message', formatMessage(user.username, message))
        })

        //runs when client disconnects
        socket.on('disconnect', () => {
            const user = userLeave(socket.id)
            if(user){
                io.to(user.room).emit('message', formatMessage(user.username, `${user.username} has left the chat`))
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })   
            }
        })
        
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })
})

const PORT = process.env.PORT
Server.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`)
} )