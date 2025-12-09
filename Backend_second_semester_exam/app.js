import * as Sentry from "@sentry/node";
import express, {json} from 'express'
import AuthRouter from './user/user.route.js';
import PostRouter from './post/post.route.js';
import rateLimit from 'express-rate-limit';
import path from 'path';

const app = express()
Sentry.setupExpressErrorHandler(app);

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

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Uncomment the line below to serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/posts', PostRouter);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  // console.error(err);
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

export default app