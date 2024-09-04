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

// Define the canvas width and height
const canvasWidth = 1024
const canvasHeight = 576

// Define the backEndPlayers Object - Information that is going to be broadcasted
const backEndPlayers = {}

// Define a backEndProjectiles Object - used to store the projectiles on the backend side
const backEndProjectiles = {}

// Create a Variable for the Speed
const SPEED = 7

// Create a Variable for the Radius
const RADIUS = 10

// Define a global variable for the projectile IDs - help distiguish them when we want to delete them
let projectileID = 0

// Listen for a Connection Event
// Establish connection between frontend and backend [In order to work the request must be made from the frontend]
io.on('connection', (socket) => {
  console.log('A User connected')

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

  // Listen for the username submission from the frontend
  socket.on('initGame', ({ username, canvasWidth, canvasHeight }) => {
    // Populate the backEndPlayers Object

    // Create the property of socket.id on the backEndPlayers object
    backEndPlayers[socket.id] = {
      x: canvasWidth * Math.random(),
      y: canvasHeight * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 75%)`,
      sequenceNumber: 0,
      score: 0,
      username: username
    }

    // Initialize the Canvas
    // Add the canvas dimensions as new properties to the backEndPlayers object
    backEndPlayers[socket.id].canvas = {
      width: canvasWidth,
      height: canvasHeight
    }

    // Add the player radius
    backEndPlayers[socket.id].radius = RADIUS
  })

  // When a user is disconnected, we call this callback function
  socket.on('disconnect', (reason) => {
    // When someone leaves, we want to make sure that it's player is deleted from the backEndPlayers object
    delete backEndPlayers[socket.id]

    // Call the updatePlayer event
    io.emit('updatePlayers', backEndPlayers)
  })

  // Listen to the keydown event [Note: Using {keyCode} like so we are directly accessing the keyCode property]
  socket.on('keydown', ({ keyCode, sequenceNumber }) => {
    // Get the backendplayer
    const backEndPlayer = backEndPlayers[socket.id]
    
    // If the player has been eliminated then we do not want to execute the code bellow
    if (!backEndPlayers[socket.id]){
      return
    }

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

    // Get the sides of the player after performing a move
    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }

    if (playerSides.left < 0){ // Left Border
      backEndPlayers[socket.id].x = backEndPlayer.radius
    }
    if (playerSides.right > canvasWidth){ // Right Border
      backEndPlayers[socket.id].x = canvasWidth - backEndPlayer.radius
    }
    if (playerSides.top < 0){ // Top Border
      backEndPlayers[socket.id].y = backEndPlayer.radius
    }
    if (playerSides.bottom > canvasHeight){ // Bottom Border
      backEndPlayers[socket.id].y = canvasHeight - backEndPlayer.radius
    }
  })
})

// BackEnd Ticker
// Create a tick rate [ticker functionality] to prevent the server from clogging from the amount of requests
setInterval(() => {
  // Update Projectile positions
  for (const id in backEndProjectiles){
    // Update the current projectile x position
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    
    // Update the current projectile y position
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y
  
    // Define a variable for the projectile radius
    const projectileRadius = 5

    // Check if the projectile goes out of the screen
    if (
      (backEndProjectiles[id].x - projectileRadius >= backEndPlayers[backEndProjectiles[id].playerID]?.canvas?.width) || // [Out of the Screen to the Right]
      (backEndProjectiles[id].x + projectileRadius <= 0) || // [Out of the Screen to the Left]
      (backEndProjectiles[id].y - projectileRadius >= backEndPlayers[backEndProjectiles[id].playerID]?.canvas?.height) || // [Out of the Screen to the Bottom]
      (backEndProjectiles[id].y + projectileRadius <= 0) // [Out of the Screen to the Top]
    ){
      // Remove the projectile from the Projectiles object
      delete backEndProjectiles[id]
      continue
    }

    // Compare every projectile to every player that is on the screen
    // If there is one projectile touching the player, then we must remove both from the game
    for (const playerID in backEndPlayers){
      // Get current backend player
      const backEndPlayer = backEndPlayers[playerID]

      // Calculate the distance between the projectile and the player
      const distance = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // If the player and the projectile (from a different player) are touching then we ought to remove them
      if ( // Collision Detection
        distance < (projectileRadius + backEndPlayer.radius) && 
        backEndProjectiles[id].playerID !== playerID
      ){
        // Check if the backend player exists
        if (backEndPlayers[backEndProjectiles[id].playerID]){
          // Get the player who shot the projectile and increse its score
          backEndPlayers[backEndProjectiles[id].playerID].score++
        }

        // Delete the backend projectile
        delete backEndProjectiles[id]

        // Delete the player from the backend
        delete backEndPlayers[playerID]

        break
      }
    }
  }

  // Update Projectiles every 15ms to the frontenc
  io.emit('updateProjectiles', backEndProjectiles)

  // Update Players every 15ms to the frontenc
  io.emit('updatePlayers', backEndPlayers)
}, 15)

// Listening to Sever Events
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('Server did Loaded')