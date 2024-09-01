const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Create a socket
// -> When initialized it is attempting to create a connection with the backend server
const socket = io()

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

// Create a player
const player = new Player(x, y, 10, 'white')

// Define a frontend players object to render all the players onto the screen
const frontendPlayers = {}

// Receive the updatePlayers Event
socket.on('updatePlayers', (backendPlayers) => {
  // Add connected players
  for (const id in backendPlayers){
    // Iterate through all the backendPlayers
    const backendPlayer = backendPlayers[id]

    // If the current backend player does not exist on the frontend
    if(!frontendPlayers[id]){
      frontendPlayers[id] = new Player(backendPlayer.x, backendPlayer.y, 10, 'white')
    }
  }

  // Remove disconnected players
  for (const id in frontendPlayers){
    // If the current frontend player does not exist on the backend, we must delete it
    if(!backendPlayers[id]){
      
      // Delete the player from the frontend
      delete frontendPlayers[id]
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  // Display all the Players
  for (const id in frontendPlayers){
    const player = frontendPlayers[id]
    player.draw()
  }
}

// Animation Loop
animate()