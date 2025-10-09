import app from './app.js';
import { config } from 'dotenv'
import { connectDB } from './config/database.js'

config();
connectDB();

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
})