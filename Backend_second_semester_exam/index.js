import express, {json} from 'express'
import { config } from 'dotenv'
import { connectDB } from './config/database.js'
import AuthRouter from './user/user.route.js';
import PostRouter from './post/post.route.js';

config();
connectDB();

const PORT = process.env.PORT || 3001

const app = express()

app.use(json());

app.get('/', (req, res) => {
  res.status(200).send('Blog Apis')
})
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/posts', PostRouter);


app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
})