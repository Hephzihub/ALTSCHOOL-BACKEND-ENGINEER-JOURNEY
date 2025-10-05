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

app.use(urlencoded({ extended: true }));
// app.use(bodyParser.json);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.get('/', (req, res) => {
  res.render('login')
});

// Catch all undefined routes and redirect to login
// app.use('*', (req, res) => {
//   res.redirect('/');
// });

app.use('/auth', authRouter);
app.use('/task', taskRouter)



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});