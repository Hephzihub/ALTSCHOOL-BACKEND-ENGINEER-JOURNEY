import express, { json } from 'express';

import studentRoutes from './routers/student.router.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(json());
app.use('/api/v1/students', studentRoutes);

app.get('/', (req, res) => {
  res.send('I\'m alive!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});