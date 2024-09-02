addEventListener('click', (event) => {
  // Grab the player position
  const playerPosition = {
    x: frontEndPlayers[socket.id].x,
    y: frontEndPlayers[socket.id].y
  }

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

//   frontEndProjectiles.push(
//     new Projectile({
//         x: playerPosition.x,
//         y: playerPosition.y, 
//         radius: 5, 
//         color: 'white',
//         velocity: velocity
//     })
//   )
})
