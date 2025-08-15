import express from "express";
import { signup, login } from "../controllers/authController.js"; // Import from controller

const router = express.Router();

router.post("/signup", signup); // Use the imported signup function
router.post("/login", login);   // Use the imported login function

export default router;
