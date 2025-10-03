import express from 'express'
import authRouter from './auth/auth.route.js';
import dotenv, { config } from 'dotenv';
import { connectDB } from './configs/database.js';

config();

// import path from 'path'
const PORT = process.env.PORT || 3001;

const app = express();
app.set('view engine', 'ejs');
// app.use(express.static(path.join(__dirname), 'public'));

connectDB();
app.use('/auth', authRouter)
app.get('/', (req, res) => {
  res.render('login')
})



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});