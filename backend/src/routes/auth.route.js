import express from 'express';
import { changePassword, login, logout, onboard, signup } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding",protectRoute, onboard);
router.put("/update-details", protectRoute, onboard); 
router.put("/change-password", protectRoute, changePassword);
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});





export default router;