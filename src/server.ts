import 'module-alias/register';
import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';

const PORT = config.PORT || 3000;

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
