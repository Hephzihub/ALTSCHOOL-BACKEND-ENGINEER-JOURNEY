const express = require(express)

const app = express();
const PORT = 3003

app.get('/', (req, res) => {
  res.send('I\'m Alive!!!');
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})