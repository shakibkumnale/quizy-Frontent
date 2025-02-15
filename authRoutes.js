import express from "express";
import {
    loginSuccess,
    logout,
    hellos,
    registration,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import passport from "passport";

const router = express.Router();

router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:5173",
        session: false,
    }),
    (req, res) => {
        const { accessToken, refreshToken } = req.user;
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 3600000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 604800000,
        });
        res.redirect("http://localhost:5173/profile");
    }
);

router.get("/login/success", verifyToken, loginSuccess);
router.get("/logout", logout);
router.get("/hello", hellos);
router.post("/registration", registration);

// export {router};
export default router;
