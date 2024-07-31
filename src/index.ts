import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import topicRoutes from './routes/topics';
import aiRoutes from './routes/ai';
import ktpRoutes from './routes/ktp';
import testRoutes from './routes/test';
import fileRoutes from './routes/fileRoutes';

const app: Application = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ktp', ktpRoutes);
app.use('/api/test', testRoutes);

mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
