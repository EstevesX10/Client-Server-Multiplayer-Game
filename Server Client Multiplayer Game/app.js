const express = require('express')
const app = express()
const port = 3000

// Make any file inside the public directory available to anybody
app.use(express.static('public'))

// Request to the Home Page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html') // Send the index.html
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('Server Loaded')