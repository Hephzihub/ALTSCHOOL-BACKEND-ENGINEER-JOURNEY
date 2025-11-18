import app from "./app.js";

import { config } from "dotenv";
import { connectDB } from "./configs/database.js";

config();

// import path from 'path'
const PORT = process.env.PORT || 3001;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
