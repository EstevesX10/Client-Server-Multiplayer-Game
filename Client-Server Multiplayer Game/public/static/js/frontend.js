// Get the canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Create a socket
// -> When initialized it is attempting to create a connection with the backend server
const socket = io();

const scoreEl = document.querySelector('#scoreEl');

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = 1024 * devicePixelRatio;
canvas.height = 576 * devicePixelRatio;

// Scale the canvas dimenesions by devicePixelRatio
ctx.scale(devicePixelRatio, devicePixelRatio);

// Define a frontend players object to render all the players onto the screen
const frontEndPlayers = {};

// Define a frontend projectiles Object to store the information regarding projectiles
const frontEndProjectiles = {};

// Create a Variable for the Speed
const SPEED = 7;

// Define the players inputs as a Array
const playerInputs = [];

// Defining a variable to keep track of the amount of keys that have been pressed
let sequenceNumber = 0;

// Define a Variable for the Cursor Position
let cursorPosition = {};

// Define a variable that determines whether or not to use Client Side Prediction
const clientSidePrediction = true;

// Define the Interpolation Rate
const interpolationRate = 0.5;

// Receive the updateProjectiles Event
socket.on('updateProjectiles', (backEndProjectiles) => {
  // Loop over the backend projectiles
  for (const id in backEndProjectiles){
    // Grab current projectile
    const backEndProjectile = backEndProjectiles[id];

    // If the current backEndProjectile does not exist in the frontend, then we ought to add it
    if (!frontEndProjectiles[id]){
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: 5,
        color: frontEndPlayers[backEndProjectile.playerID]?.color,
        velocity: backEndProjectile.velocity
      });
    } else { // The Projectile already exists
      // Update the position of the frontend projectile based on the velocity retrieved by the backend projectiles
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }

  // Remove unnecessary projectiles from the frontend
  for (const frontEndProjectileID in frontEndProjectiles){
    // If the current frontend projectile does not exist on the backend, we must delete it
    if(!backEndProjectiles[frontEndProjectileID]){
      // Delete the projectile from the frontend
      delete frontEndProjectiles[frontEndProjectileID];
    }
  }
});

// Receive the updatePlayers Event
socket.on('updatePlayers', (backEndPlayers) => {
  // Add connected players
  for (const id in backEndPlayers){
    // Iterate through all the backEndPlayers
    const backEndPlayer = backEndPlayers[id];

    // If the current backend player does not exist on the frontend
    if(!frontEndPlayers[id]){
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 10, 
        color: backEndPlayer.color,
        username: backEndPlayer.username
      });

      // Add the current player to the Leaderboard by adding a div for the player score to index.html file
      document.querySelector(
        "#playerLabels"
      ).innerHTML += `<div class="playerScore" data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username}: ${backEndPlayer.score}</div>`;
      
    } else { // The player already exists
      // Score Management
      // Get the specific div of the current player we are looping over and update the label score in the div
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${backEndPlayer.username}: ${backEndPlayer.score}`;

      // Update the data-score property inside the div
      document.querySelector(
        `div[data-id="${id}"]`
      ).setAttribute('data-score', backEndPlayer.score);

      // Grab the parent div
      const parentDiv = document.querySelector('#playerLabels');

      // Get all the child divs inside the parent one into a Array [Essencially grabbing all the players divs in the leaderboard]
      const childDivs = Array.from(parentDiv.querySelectorAll('div'));

      // Loop over all the child divs and sort all the contents within the child divs - Sort the Leaderboard scores
      childDivs.sort((a, b) => {
        // Grab each element data score attribute
        const scoreA = Number(a.getAttribute('data-score'));
        const scoreB = Number(b.getAttribute('data-score'));

        // Returning the value based on descending order
        return scoreB - scoreA;
      })

      // Removed old elements [Update the frontend]
      childDivs.forEach((div) => {
        parentDiv.removeChild(div);
      })

      // Adds sorted elements [Update the frontend]
      childDivs.forEach((div) => {
        parentDiv.appendChild(div);
      })

      // -> Update the frontend players positions
      // Get target position of the player
      frontEndPlayers[id].targetPosition = {
        x: backEndPlayer.x,
        y: backEndPlayer.y
      };

      // Call the Server Reconciliation code [Used to fix lag] 
      if (id === socket.id){ // The current player id is the same as the connection id - Found the player which is being used in the current connection
        // Get the last back end input index [index aka sequence number]
        const lastBackEndInputIndex = playerInputs.findIndex((input) => {
          // Return the last sequence number / id processed in the backend server
          return backEndPlayer.sequenceNumber === input.sequenceNumber;
        })

        if (lastBackEndInputIndex > -1){
          // Splice out all the unnecessary events (Inputs: idx to start and stop removing numbers)
          playerInputs.splice(0, lastBackEndInputIndex + 1);
        }

        // Perform the remaining events
        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx;
          frontEndPlayers[id].y += input.dy;
        })

        // Update the current mouse position on the client side
        frontEndPlayers[id].updateCursorPosition({
          newCursorX: cursorPosition.x,
          newCursorY: cursorPosition.y
        });
      } else{ // Update the movement to the other players
        frontEndPlayers[id].x = backEndPlayer.x;
        frontEndPlayers[id].y = backEndPlayer.y;
      }
    }
  }

  // Remove disconnected players
  for (const id in frontEndPlayers){
    // If the current frontend player does not exist on the backend, we must delete it
    if(!backEndPlayers[id]){
      // Grab the the player div from the Leaderboard
      const divToRemove = document.querySelector(`div[data-id="${id}"]`);

      // Remove the fetched div
      divToRemove.parentNode.removeChild(divToRemove);

      // Reshow the interface if we got eliminated from the game
      if (id === socket.id){
        document.querySelector('#usernameForm').style.display = 'block';
      }

      // Delete the player from the frontend
      delete frontEndPlayers[id];
    }
  }
});

// PROBLEM: THE CURSOR ORIENTATION IS NOT BEING PROPERLY UPDATED IN OTHER WINDOWS - WHEN USING THE SHIP ICON WITH THE ENEMY PLAYERS

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Display all the Players
  for (const id in frontEndPlayers){
    // Get current frontEndPlayer
    const frontEndPlayer = frontEndPlayers[id];

    // If the current player has a target Position property
    if (frontEndPlayers[socket.id] && frontEndPlayer.targetPosition){
      // Interpolate the current position to the target based on a interpolation rate
      frontEndPlayers[socket.id].x += (frontEndPlayers[socket.id].targetPosition.x - frontEndPlayers[socket.id].x) * interpolationRate;
      frontEndPlayers[socket.id].y += (frontEndPlayers[socket.id].targetPosition.y - frontEndPlayers[socket.id].y) * interpolationRate;
    }
    if (socket.id == id){
      frontEndPlayer.drawPlayer();
    } else {
      frontEndPlayer.drawEnemy();
    }
  }

  // Display all the Projectiles
  for (const id in frontEndProjectiles){
    const frontEndProjectile = frontEndProjectiles[id];
    frontEndProjectile.draw();
  }
}

// Animation Loop
animate();

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
};

// Use a frontEnd SetInterval
setInterval(() => {
  if (keys.w.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++;

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: 0, dy: - SPEED });

    if (clientSidePrediction){
      // Client Sided Prediction
      // Predict Up Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend  
      frontEndPlayers[socket.id].y -= SPEED;
    }
    
    // Submit the KeyW event to the backend
    socket.emit('keydown', { keyCode: 'KeyW', sequenceNumber });
  }

  if (keys.a.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++;

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: - SPEED, dy: 0 });

    if (clientSidePrediction){
      // Client Sided Prediction
      // Predict Left Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend
      frontEndPlayers[socket.id].x -= SPEED;
    }

    // Submit the KeyA event to the backend
    socket.emit('keydown', { keyCode: 'KeyA', sequenceNumber });
  }

  if (keys.s.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++;

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });

    if (clientSidePrediction){
      // Client Sided Prediction
      // Predict Down Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend
      frontEndPlayers[socket.id].y += SPEED;
    }

    // Submit the KeyS event to the backend
    socket.emit('keydown', { keyCode: 'KeyS', sequenceNumber });
  }

  if (keys.d.pressed){
    // Update the sequenceNumber since a key has been pressed
    sequenceNumber++;

    // Add the input to the playerInputs Array (The current key press counter and the velocity in both x and y axis)
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });

    if (clientSidePrediction){
      // Client Sided Prediction
      // Predict Rights Movement [Used to fight latency] - If the values are changed, the other players remain safe since all the moves are coordinated trough the backend
      frontEndPlayers[socket.id].x += SPEED;
    }

    // Submit the KeyD event to the backend
    socket.emit('keydown', { keyCode: 'KeyD', sequenceNumber });
  }
}, 15);

// Add a Event Listener to when a key is pressed
window.addEventListener('keydown', (event) => {
  // To prevent frontEnd errors when the player has yet to be created
  if (!frontEndPlayers[socket.id]){
    return;
  }
  
  switch(event.code){
    case 'KeyW':
      // Update the W key object
      keys.w.pressed = true;
      break;

    case 'KeyA':
      // Update the A key object
      keys.a.pressed = true;
      break;

    case 'KeyS':
      // Update the S key object
      keys.s.pressed = true;
      break;

    case 'KeyD':
      // Update the D key object
      keys.d.pressed = true;
      break;
  }
});

// Add a Event Listener to when a key is no longer pressed
window.addEventListener('keyup', (event) => {
  
  // To prevent frontEnd errors when the player has yet to be created
  if (!frontEndPlayers[socket.id]){
    return;
  }
  
  switch(event.code){
    case 'KeyW':
      // Update the W key object
      keys.w.pressed = false;
      break;
    
    case 'KeyA':
      // Update the A key object
      keys.a.pressed = false;
      break;

    case 'KeyS':
      // Update the S key object
      keys.s.pressed = false;
      break;
    
    case 'KeyD':
      // Update the D key object
      keys.d.pressed = false;
      break;
  }
});

window.addEventListener('mousemove', (event) => {
  // If the player is already in the game
  if (frontEndPlayers[socket.id]){
    // Get the offset margins of the canvas in order to update the coordenates management
    const { top, left } = canvas.getBoundingClientRect();
    
    // Calculating the current mouse position and saving its values
    cursorPosition.x = event.clientX - left;
    cursorPosition.y = event.clientY - top;
  }
});

// Add a event listener when someone interacts with the form to input a username
document.querySelector(
  '#usernameForm'
).addEventListener('submit', (event) => {
  // Prevent the default behaviour of the element this event is currentlt being fired on
  event.preventDefault();

  // Grab the input element
  const usernameInput = document.querySelector('#usernameInput').value;

  // We only add a player if a username was given
  if (usernameInput){
    // Hide the form once we submit a form
    document.querySelector('#usernameForm').style.display = 'none';

    // Emit the username to the backend when the text is submitted in the form
    socket.emit('initGame', {
      username: usernameInput,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
  }
});