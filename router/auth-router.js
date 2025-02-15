import express from "express";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();
import { home, register, score, fetchtopic, getquetion, selecttopic, login, otp, user, logout } from '../controllers/auth-controller.js';

router.route('/api/users/login').post(login);
router.route('/api/otp').post(otp);
router.route('/api/').get(home);
router.route('/api/fetchtopic').post(verifyToken, fetchtopic);
router.route('/api/f').post(fetchtopic);
router.route('/api/questions/:topic').post(verifyToken, getquetion);
router.route('/api/user').get(verifyToken, user);
router.route('/api/score').post(verifyToken, score);
router.route('/api/select').post(verifyToken, selecttopic);
router.route('/api/users/register').post(register);
router.route('/api/users/logout').post(logout); // Add logout route

export { router };
