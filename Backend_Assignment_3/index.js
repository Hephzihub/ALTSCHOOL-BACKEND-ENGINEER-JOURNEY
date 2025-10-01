import express from 'express'
import authRouter from './auth/auth.route.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.set('view engine', 'ejs');

app.use('/auth', authRouter)
app.get('/', (req, res) => {
  res.render('login')
})



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});