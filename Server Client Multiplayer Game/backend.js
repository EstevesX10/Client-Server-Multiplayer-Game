const express = require('express')
const app = express()

// Define the Backend HTTP Server
const http = require('http')
const server = http.createServer(app)

// [Note: A Socket.io server needs a http connection which is why we created a http server and not used the express server]

// Getting the object associated with the socket.io library
const { Server } = require('socket.io')

// Defining a Socket.io sever 
const io = new Server(server, { pingInterval : 2000, pingTimeout: 5000 })

// Define the Connection Port
const port = 3000

// Make any file inside the public directory available to anybody
app.use(express.static('public'))

// Response to the request of access to the Home Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html') // Send the index.html
})

// Define the backEndPlayers Object - Information that is going to be broadcasted
const backEndPlayers = {}

// Define a backEndProjectiles Object - used to store the projectiles on the backend side
const backEndProjectiles = {}

// Create a Variable for the Speed
const SPEED = 10

// Define a global variable for the projectile IDs - help distiguish them when we want to delete them
let projectileID = 0

// Listen for a Connection Event
// Establish connection between frontend and backend [In order to work the request must be made from the frontend]
io.on('connection', (socket) => {
  console.log('A User connected')

  // Populate the backEndPlayers Object

  // Create the property of socket.id on the backEndPlayers object
  backEndPlayers[socket.id] = {
    x:500 * Math.random(),
    y:500 * Math.random(),
    color: `hsl(${360 * Math.random()}, 100%, 50%)`,
    sequenceNumber: 0
  }

  // Note: If we wanted to make an event to the player who connected, we would use socket.emit(...)
  // Broadcast the state of every player to every single client's frontend
  io.emit('updatePlayers', backEndPlayers)

  // Listen for a shoot Event
  socket.on('shoot', ({ x, y, angle }) => {
    // Update the Projectile ID into a new unique value
    projectileID++

    // Calculte the Projectile's Velocity on the backend
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    // Store a new backend projectile
    backEndProjectiles[projectileID] = {
      x,
      y,
      velocity,
      playerID: socket.id
    }
  })

  // When a user is disconnected, we call this callback function
  socket.on('disconnect', (reason) => {
    console.log(reason)

    // When someone leaves, we want to make sure that it's player is deleted from the backEndPlayers object
    delete backEndPlayers[socket.id]

    // Call the updatePlayer event
    io.emit('updatePlayers', backEndPlayers)
  })

  // Listen to the keydown event [Note: Using {keyCode} like so we are directly accessing the keyCode property]
  socket.on('keydown', ({ keyCode, sequenceNumber }) => {
    // Update the current backEnd player's sequence number
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    
    // Player Movement discrimination
    switch (keyCode) {
      case 'KeyW': // Up
      backEndPlayers[socket.id].y -= SPEED
      break

    case 'KeyD': // Right
      backEndPlayers[socket.id].x += SPEED
      break

    case 'KeyS': // Down
      backEndPlayers[socket.id].y += SPEED
      break
    
    case 'KeyA': // Left
      backEndPlayers[socket.id].x -= SPEED
      break
    }
  })

  console.log(backEndPlayers)
})

// Create a tick rate [ticker functionality] to prevent the server from clogging from the amount of requests
setInterval(() => {
  // Update Players every 15ms
  io.emit('updatePlayers', backEndPlayers)
}, 15)


// Listening to Sever Events
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('Server did Loaded')