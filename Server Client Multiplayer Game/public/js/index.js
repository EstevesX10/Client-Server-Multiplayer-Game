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
const players = {}

// Receive the updatePlayers Event
socket.on('updatePlayers', (backendPlayers) => {
  // Iterate through all the backendPlayers
  for (const id in backendPlayers){
    const backendPlayer = backendPlayers[id]

    // If the current backend player does not exist on the frontend
    if(!players[id]){
      players[id] = new Player(backendPlayer.x, backendPlayer.y, 10, 'white')
    }
  }
})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  // Display all the Players
  for (const id in players){
    const player = players[id]
    player.draw()
  }
}

// Animation Loop
animate()