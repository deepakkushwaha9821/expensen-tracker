import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
    const expenses = await Expense.find({ userId: req.user });
    res.json(expenses);
});

router.post("/", async (req, res) => {
    const expense = await Expense.create({ ...req.body, userId: req.user });
    res.json(expense);
});

export default router;
