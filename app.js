import express from 'express';
import dotenv from 'dotenv';
import connectDB from './connection/connect.js';
import { router } from './router/auth-router.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure CORS to allow all methods and dynamic origin
app.use(
  cors({
    origin: process.env.CORS || 'https://quizmaster-seven.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

const port = process.env.PORT || 10211;

app.use('/', router);

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}!`)
);
