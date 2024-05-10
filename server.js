const express = require('express')
const app = express()
const http = require('http').createServer(app)

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
let id = 0 // Unique id for each message
// Socket 
const io = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.emit('id', id)
    socket.on('message', (msg) => {
        id = id + 1
        wrappedMsg = {
            id: id,
            user: msg.user,
            message: msg.message
        }
        socket.broadcast.emit('message', wrappedMsg)
    })
    socket.on('emoji_reaction', (data) => {
        console.log(data)
        io.emit('emoji_reaction', data);  
    });
})