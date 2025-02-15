import express from 'express';
import './utils/env.js';
import connectDB from './connection/connect.js';
import { router } from './router/auth-router.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();
connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Update CORS configuration to allow requests from the frontend's origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

const port = process.env.PORT || 10211;

app.use('/', router);

app.listen(port, () => console.log(`Example app listening on port http://localhost:${port}!`));