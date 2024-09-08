addEventListener('click', (event) => {
  // If the player is already in the game, then we can calculate and perform the shooting
  if (frontEndPlayers[socket.id]){
    // Get the canvas
    const canvas = document.querySelector('canvas');
    
    // Get the offset margins of the canvas in order to update the coordenates management
    const { top, left } = canvas.getBoundingClientRect();

    // Grab the player position
    const playerPosition = {
      x: frontEndPlayers[socket.id].x,
      y: frontEndPlayers[socket.id].y
    };

    // Calculate the angle in which the projectile is to be sent
    const angle = Math.atan2(
      event.clientY - top - playerPosition.y,
      event.clientX - left - playerPosition.x
    );

    // Submit the shoot event to the backend
    socket.emit('shoot', {
      x: playerPosition.x,
      y: playerPosition.y,
      angle: angle
    });
  }
});