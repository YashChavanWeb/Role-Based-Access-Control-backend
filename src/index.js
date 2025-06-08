import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './config/dbConnect.js';

dotenv.config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Routes
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import documentRoutes from './routes/document.routes.js'

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Health Check');
});

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
