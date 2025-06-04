import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import chapterRoutes from './Routes/chapterRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/v1/chapters', chapterRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});