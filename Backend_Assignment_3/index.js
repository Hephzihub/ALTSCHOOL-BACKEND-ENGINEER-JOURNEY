import express, { urlencoded } from 'express'
import authRouter from './auth/auth.route.js';
import taskRouter from './tasks/task.route.js';
import { config } from 'dotenv';
import { connectDB } from './configs/database.js';
import session from 'express-session';

config();

// import path from 'path'
const PORT = process.env.PORT || 3001;

const app = express();
app.set('view engine', 'ejs');

connectDB();
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.get('/', (req, res) => {
  // Redirect to tasks if logged in, otherwise to login
  if (req.session && req.session.userId) {
    return res.redirect('/task');
  }
  return res.redirect('/auth/login');
});

app.use('/auth', authRouter);
app.use('/task', taskRouter)

app.use((req, res) => {
  res.status(404).render('404', { 
    message: 'Page not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});