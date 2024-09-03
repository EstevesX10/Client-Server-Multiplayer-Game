const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// Create a socket
// -> When initialized it is attempting to create a connection with the backend server
const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

// Scale the canvas dimenesions by devicePixelRatio
ctx.scale(devicePixelRatio, devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

// Define a frontend players object to render all the players onto the screen
const frontEndPlayers = {}

// Define a frontend projectiles Object to store the information regarding projectiles
const frontEndProjectiles = {}

// Receive the updateProjectiles Event
socket.on('updateProjectiles', (backEndProjectiles) => {
  // Loop over the backend projectiles
  for (const id in backEndProjectiles){
    // Grab current projectile
    const backEndProjectile = backEndProjectiles[id]

    // If the current backEndProjectile does not exist in the frontend, then we ought to add it
    if (!frontEndProjectiles[id]){
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerID]?.color,
        velocity: backEndProjectile.velocity
      })
    } else { // The Projectile already exists
      // Update the position of the frontend projectile based on the velocity retrieved by the backend projectiles
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
    }
  }

  // Remove unnecessary projectiles from the frontend
  for (const frontEndProjectileID in frontEndProjectiles){
    // If the current frontend projectile does not exist on the backend, we must delete it
    if(!backEndProjectiles[frontEndProjectileID]){
      // Delete the projectile from the frontend
      delete frontEndProjectiles[frontEndProjectileID]
    }
  }
})

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

      // Add the current player to the Leaderboard by adding a div for the player score to index.html file
      document.querySelector(
        "#playerLabels"
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`
      
    } else { // The player already exists
      // Get the specific div of the current player we are looping over and update the label score in the div
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`

      // Update the data-score property inside the div
      document.querySelector(
        `div[data-id="${id}"]`
      ).setAttribute('data-score', backEndPlayer.score)

      // Grab the parent div
      const parentDiv = document.querySelector('#playerLabels')

      // Get all the child divs inside the parent one into a Array [Essencially grabbing all the players divs in the leaderboard]
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      // Loop over all the child divs and sort all the contents within the child divs - Sort the Leaderboard scores
      childDivs.sort((a, b) => {
        // Grab each element data score attribute
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))

        // Returning the value based on descending order
        return scoreB - scoreA
      })

      // Removed old elements [Update the frontend]
      childDivs.forEach(div => {
        parentDiv.removeChild(div)
      })

      // Adds sorted elements [Update the frontend]
      childDivs.forEach(div => {
        parentDiv.appendChild(div)
      })

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
      // Grab the the player div from the Leaderboard
      const divToRemove = document.querySelector(`div[data-id="${id}"]`)

      // Remove the fetched div
      divToRemove.parentNode.removeChild(divToRemove)

      // Reshow the interface if we got eliminated from the game
      if (id === socket.id){
        document.querySelector('#usernameForm').style.display = 'block'
      }

      // Delete the player from the frontend
      delete frontEndPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Display all the Players
  for (const id in frontEndPlayers){
    const frontEndPlayer = frontEndPlayers[id]
    frontEndPlayer.draw()
  }

  // Display all the Projectiles
  for (const id in frontEndProjectiles){
    const frontEndProjectile = frontEndProjectiles[id]
    frontEndProjectile.draw()
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

// Add a event listener when someone interacts with the form to input a username
document.querySelector(
  '#usernameForm'
).addEventListener('submit', (event) => {
  // Prevent the default behaviour of the element this event is currentlt being fired on
  event.preventDefault()

  // Grab the input element
  const usernameInput = document.querySelector('#usernameInput').value

  // We only add a player if a valid username was given
  if (usernameInput){
    // Hide the form once we submit a form
    document.querySelector('#usernameForm').style.display = 'none'

    // Emit the username to the backend when the text is submitted in the form
    socket.emit('initGame', {
      username: usernameInput,
      canvasWidth: canvas.width, 
      canvasHeight: canvas.height
    })
  }
})