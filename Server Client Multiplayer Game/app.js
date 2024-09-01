const express = require('express')
const app = express()

// Define the Backend HTTP Server
const http = require('http')
const server = http.createServer(app)

// [Note: A Socket.io server needs a http connection which is why we created a http server and not used the express server]

// Getting the object associated with the socket.io library
const { Server } = require('socket.io')

// Defining a Socket.io sever 
const io = new Server(server)

const port = 3000

// Make any file inside the public directory available to anybody
app.use(express.static('public'))

// Response to the request of access to the Home Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html') // Send the index.html
})

// Define the Players Object - Information that is going to be broadcasted
const players = {}

// Listen for a Connection Event
// Establish connection between frontend and backend [In order to work the request must be made from the frontend]
io.on('connection', (socket) => {
  console.log('A User connected')

  // Populate the Players Object

  // Create the property of socket.id on the players object
  players[socket.id] = {
    x:500 * Math.random(),
    y:500 * Math.random()
  }

  // Note: If we wanted to make an event to the player who connected, we would use socket.emit(...)
  // Broadcast the state of every player to every single client's frontend
  io.emit('updatePlayers', players)

  // When a user is disconnected, we call this callback function
  socket.on('disconnect', (reason) => {
    console.log(reason)

    // When someone leaves, we want to make sure that it's player is deleted from the players object
    delete players[socket.id]

    // Call the updatePlayer event
    io.emit('updatePlayers', players)
  })

  console.log(players)
})

// Listening to Sever Events
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('Server did Loaded')