// utils/env.js
// This file is responsible for loading environment variables from the .env file
// into the Node.js process using the dotenv package.
//
// Why this file is important:
// - Environment variables must be available before other modules that depend on them are executed.
// - For example, the passport.js module uses process.env.CLIENT_ID and process.env.CLIENT_SECRET.
// - If those variables are not loaded before passport.js is imported, it will throw errors.
//
// By isolating dotenv.config() in this file and importing it at the top of index.js,
// we ensure that all environment variables are loaded globally before any other modules are initialized.
import dotenv from 'dotenv';
dotenv.config();
