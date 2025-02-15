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
    origin: process.env.CORS || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const port = process.env.PORT || 10211;

app.use('/', router);

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}!`)
);
