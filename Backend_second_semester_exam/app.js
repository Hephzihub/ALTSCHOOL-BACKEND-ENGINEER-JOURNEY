import express, {json} from 'express'
import AuthRouter from './user/user.route.js';
import PostRouter from './post/post.route.js';
import rateLimit from 'express-rate-limit';
import path from 'path';

const app = express()

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(limiter);

app.use(json());

app.get('/', (req, res) => {
  res.status(200).send('Blog Apis')
})
// Uncomment the line below to serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/posts', PostRouter);

export default app