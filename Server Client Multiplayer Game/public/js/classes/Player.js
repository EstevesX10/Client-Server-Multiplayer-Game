// There is a Problem - the Players are not being properly processed in the Backend

class Player {
  constructor({ x, y, radius, color, username }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.username = username
  
    // Unicode for the "Jet Fighter Up" Font Awesome icon
    this.icon = '\uf0fb'

    // Initialize the cursor position
    this.cursorX = 0
    this.cursorY = 0
  }

  // Method to update the cursor position
  updateCursorPosition({ newCursorX, newCursorY }) {
    this.cursorX = newCursorX
    this.cursorY = newCursorY
    console.log('UPDATE CURSOR POSITION')
  }

  // Calculate the angle between the player's position and the cursor's position
  calculateAngle() {
    return Math.atan2(
      this.cursorY - this.y,
      this.cursorX - this.x
    )
  }

  drawCircle(){
    // Save the current context state
    ctx.save()

    // Set up shadow properties
    ctx.shadowColor = this.color
    ctx.shadowBlur = 10
    
    // Draw the player's circle
    ctx.beginPath()
    ctx.arc(
      this.x,
      this.y,
      this.radius,
      0,
      Math.PI * 2,
      false
    )
    ctx.fillStyle = this.color
    ctx.fill()

    // Restore the context to its original state
    ctx.restore()
  }  

  drawFighterShip(){
    // Save the current context state
    ctx.save()    

    // Move to the player's position
    ctx.translate(this.x, this.y)

    // Rotate the context to point towards the cursor
    ctx.rotate(this.calculateAngle())

    // Set the font size and style
    ctx.font = `${this.radius * 2}px FontAwesome`
    ctx.fillStyle = this.color
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Draw the Font Awesome icon at the origin (0, 0) because we've translated the context
    ctx.fillText(this.icon, 0, 0)

    // Restore the context to its original state
    ctx.restore()
  }

  drawUsername(){
    // Set the font for the username
    ctx.font = '12px sans-serif'

    // Measure the width of the username text
    const textWidth = ctx.measureText(this.username).width
    
    // Set the fill color for the text
    ctx.fillStyle = this.color

    // Set the stroke color for the text (border color)
    ctx.strokeStyle = 'black'

    // Set the width of the border
    ctx.lineWidth = 2

    // Draw the text outline
    ctx.strokeText(this.username, this.x - textWidth / 2, this.y + 30)

    // Draw the username text
    ctx.fillText(this.username, this.x - textWidth / 2, this.y + 30)
    
    // Save the current context state
    ctx.save()

    // Set up shadow properties
    ctx.shadowColor = this.color
    ctx.shadowBlur = 10

    // Restore the context to its original state
    ctx.restore()
  }

  draw() {
    // Draw the players username
    this.drawUsername()

    // Draw the players ship
    // this.drawFighterShip()

    this.drawCircle()
  }
}