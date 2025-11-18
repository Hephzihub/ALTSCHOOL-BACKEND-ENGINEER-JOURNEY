import express, { urlencoded } from 'express'
import authRouter from './auth/auth.route.js';
import taskRouter from './tasks/task.route.js';
import session from 'express-session';
import { config } from "dotenv";

config()

const app = express();
app.set('view engine', 'ejs');

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


export default app