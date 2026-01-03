import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './configs/database.js';

config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});