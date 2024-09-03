class Player {
  constructor({ x, y, radius, color }) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {

    const image = new Image()
    image.src = "https://fontawesome.com/icons/jet-fighter-up?f=classic&s=solid"
    image.addEventListener("load", () => ctx.drawImage(image, 20, 20));

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * window.devicePixelRatio, 0, Math.PI * 2, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}
