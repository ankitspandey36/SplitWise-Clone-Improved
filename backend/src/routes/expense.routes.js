import { Router } from 'express';
import { addExpense, settleExpense, deleteExpense, getAllExpenses,getEveryExpense } from '../controllers/expense.controller.js'
import { verifyjwt } from '../middlewares/verifyjwt.middleware.js';
const router = Router();

router.post("/add-expense", verifyjwt, addExpense);
router.post("/settle-expense", verifyjwt, settleExpense);
router.post("/delete-expense", verifyjwt, deleteExpense);
router.get("/get-expense", verifyjwt, getAllExpenses);
router.get("/get-every-expense", verifyjwt, getEveryExpense);




export default router