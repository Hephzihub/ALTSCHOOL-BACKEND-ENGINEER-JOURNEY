import express, {json} from 'express'
import AuthRouter from './user/user.route.js';
import PostRouter from './post/post.route.js';

const app = express()

app.use(json());

app.get('/', (req, res) => {
  res.status(200).send('Blog Apis')
})
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/posts', PostRouter);

export default app