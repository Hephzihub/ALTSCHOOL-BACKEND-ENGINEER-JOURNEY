import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './configs/database.js';
import birthdayRouter from './birthday/birthday.route.js';
import EmailService from './emailLog/email.service.js';
import cron from 'node-cron';

config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});
app.use('/api/birthdays', birthdayRouter);

// Manual trigger endpoint (for testing)
app.post('/api/trigger-cron', async (req, res) => {
  try {
    // const dummyUser = {
    //   username: "Test User",
    //   email: "oluwasegunadedejiwork@gmail.com",
    //   dateOfBirth: "1997-05-13"
    // }
    // const result = await EmailService.sendBirthdayEmail(dummyUser);
    const result = await EmailService.sendBulkBirthdayEmails();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule cron job - runs every day at 7 AM
cron.schedule('0 7 * * *', async () => {
  console.log('Running birthday check cron job...');
  await EmailService.sendBulkBirthdayEmails();
}, {
  timezone: 'Africa/Lagos' // Time zone can be adjusted as needed
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});