const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Create a socket
// -> When initialized it is attempting to create a connection with the backend server
const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2

// Define a frontend players object to render all the players onto the screen
const frontEndPlayers = {}

// Receive the updatePlayers Event
socket.on('updatePlayers', (backEndPlayers) => {
  // Add connected players
  for (const id in backEndPlayers){
    // Iterate through all the backEndPlayers
    const backEndPlayer = backEndPlayers[id]

    // If the current backend player does not exist on the frontend
    if(!frontEndPlayers[id]){
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10, 
        color: backEndPlayer.color
      })
    } else { // The player already exists
      if (id === socket.id){ // Call the Server Reconciliation code [Used to fix lag]
        // Update the frontEndPlayer based on the movements performed in the backend server
        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y
        
        // Get the last back end input index [index aka sequence number]
        const lastBackEndInputIndex = playerInputs.findIndex(input => {
          // Return the last sequence number / id processed in the backend server
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackEndInputIndex >= 0){
          // Splice out all the unnecessary events (Inputs: idx to start and stop removing numbers)
          playerInputs.splice(0, lastBackEndInputIndex + 1)
        }

        // Perform the remaining events
        playerInputs.forEach(input => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
      } else {
        // Update the other frontEndPlayers based on the movements performed in the backend server
        // frontEndPlayers[id].x = backEndPlayer.x
        // frontEndPlayers[id].y = backEndPlayer.y

        // Interpolate the other player's position
        gsap.to(frontEndPlayers[id], { // We define the initial position and the position to which we want to interpolate as in: x [start] : backEndPlayer.x [Where we want to interpolate to]
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })

      }
    }
  }

  // Remove disconnected players
  for (const id in frontEndPlayers){
    // If the current frontend player does not exist on the backend, we must delete it
    if(!backEndPlayers[id]){
      // Delete the player from the frontend
      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  // Display all the Players
  for (const id in frontEndPlayers){
    const frontEndPlayer = frontEndPlayers[id]
    frontEndPlayer.draw()
  }
}

// Animation Loop
animate()

// Define a constant for the keys the user is currently pressing down
const keys = {
  w : {
    pressed: false
  },
  a : {
    pressed: false
  },
  s : {
    pressed: false
  },
  d : {
    pressed: false
  }
}

// Create a Variable for the Speed
const SPEED = 10

// Define the players inputs as a Array
const playerInputs = []

// Defining a variable to keep track of the amount of keys that have been pressed
let sequenceNumber = 0

// Use a frontEnd SetInterval
setInterval(() => {
  if (keys.w.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })

    // Client Sided Prediction
    // Predict Up Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend  
    frontEndPlayers[socket.id].y -= SPEED

    // Submit the KeyW event to the backend
    socket.emit('keydown', { keyCode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })

    // Client Sided Prediction
    // Predict Left Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend
    frontEndPlayers[socket.id].x -= SPEED

    // Submit the KeyA event to the backend
    socket.emit('keydown', { keyCode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })

    // Client Sided Prediction
    // Predict Down Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend
    frontEndPlayers[socket.id].y += SPEED

    // Submit the KeyS event to the backend
    socket.emit('keydown', { keyCode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })

    // Client Sided Prediction
    // Predict Rights Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend
    frontEndPlayers[socket.id].x += SPEED

    // Submit the KeyD event to the backend
    socket.emit('keydown', { keyCode: 'KeyD', sequenceNumber })
  }
}, 15)

// Add a Event Listener to when a key is pressed
window.addEventListener('keydown', (event) => {
  // To prevent frontEnd errors when the player has yet to be created
  if (!frontEndPlayers[socket.id]){
    return
  }
  
  switch(event.code){
    case 'KeyW':
      // Update the W key object
      keys.w.pressed = true
      break

    case 'KeyA':
      // Update the A key object
      keys.a.pressed = true
      break

    case 'KeyS':
      // Update the S key object
      keys.s.pressed = true
      break

    case 'KeyD':
      // Update the D key object
      keys.d.pressed = true
      break
  }
})

// Add a Event Listener to when a key is no longer pressed
window.addEventListener('keyup', (event) => {
  
  // To prevent frontEnd errors when the player has yet to be created
  if (!frontEndPlayers[socket.id]){
    return
  }
  
  switch(event.code){
    case 'KeyW':
      // Update the W key object
      keys.w.pressed = false
      break
    
    case 'KeyA':
      // Update the A key object
      keys.a.pressed = false
      break

    case 'KeyS':
      // Update the S key object
      keys.s.pressed = false
      break
    
    case 'KeyD':
      // Update the D key object
      keys.d.pressed = false
      break
  }
})