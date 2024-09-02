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