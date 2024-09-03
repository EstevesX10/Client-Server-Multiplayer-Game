addEventListener('click', (event) => {
  // Grab the player position
  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y
  }

  // Calculate the angle in which the projectile is to be sent
  const angle = Math.atan2(
    event.clientY * window.devicePixelRatio - playerPosition.y,
    event.clientX * window.devicePixelRatio - playerPosition.x
  )

  // Submit the shoot event to the backend
  socket.emit('shoot', {
    x: playerPosition.x,
    y: playerPosition.y,
    angle: angle
  })
})

// addEventListener('mousemove', (event) => {
//     // Grab the player position
//     const playerPosition = {
//         x: frontEndPlayers[socket.id].x,
//         y: frontEndPlayers[socket.id].y
//     }
    
//     // Grab current mouse position and update the player cursor position
//     frontEndPlayers[socket.id].updateCursorPosition({
//         x: event.clientX * window.devicePixelRatio - playerPosition.x,
//         y: event.clientY * window.devicePixelRatio - playerPosition.y
//     })
// })