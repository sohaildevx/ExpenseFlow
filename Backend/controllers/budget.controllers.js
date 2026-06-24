import Budget from '../model/budget.model.js';
import Expense from '../model/expense.model.js';
import { validationResult } from 'express-validator';

export const createBudget = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => ({ ...e, value: undefined })) });
    }

    try {
        const userId = req.user.id;
        const { category, limit, period, startDate, endDate } = req.body;

        const newBudget = await Budget.create({
            userId,
            category,
            limit,
            period,
            startDate,
            endDate
        })
        return res.status(201).json({ message: "Budget created successfully", newBudget });
    } catch (error) {
        console.error("Create budget error:", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again."});
    }
}

export const getBudget = async(req,res)=>{
    const {id} = req.params;

    try {
        const userId = req.user.id;
        const budget = await Budget.findOne({_id:id, userId});
        if(!budget){
            return res.status(404).json({message: "Budget not found"});
        }
        
        const expenses = await Expense.find({
            userId,
            category: budget.category,
            date: {
                $gte: new Date(budget.startDate),
                $lte: new Date(budget.endDate)
            }
        });
        
        const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
        
        const budgetWithSpent = {
            ...budget.toObject(),
            spent
        };
        
        return res.status(200).json({message: "Budget fetched successfully", budget: budgetWithSpent});
    } catch (error) {
        console.error("Get budget error:", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again."});
    }
}

export const getAllBudgets = async(req,res)=>{
    try{
        const userId = req.user.id;
        const budgets = await Budget.find({userId}).sort({createdAt: -1});
        
       
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const budgetObj = budget.toObject();
                
                
                const expenses = await Expense.find({
                    userId,
                    category: budget.category,
                    date: {
                        $gte: new Date(budget.startDate),
                        $lte: new Date(budget.endDate)
                    }
                });
                
                const spent = expenses.reduce((total, expense) => total + expense.amount, 0);
                
                return {
                    ...budgetObj,
                    spent
                };
            })
        );
        
        return res.status(200).json({budgets: budgetsWithSpent, count: budgetsWithSpent.length});
    }catch(error){
        console.error("Get all budgets error:", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
}

export const updateBudget = async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => ({ ...e, value: undefined })) });
    }

    const {id} = req.params;

    try {
        const userId = req.user.id;
        const allowedFields = ['category', 'limit', 'period', 'startDate', 'endDate'];
        const updates = {};
        for(const field of allowedFields){
            if(req.body[field] !== undefined){
                updates[field] = req.body[field];
            }
        }

        const updatedBudget = await Budget.findOneAndUpdate(
            {_id: id, userId},
            {$set: updates},
            {new: true}
        );
        if(!updatedBudget){
            return res.status(404).json({message: "Budget not found"});
        }
        return res.status(200).json({message: "Budget updated successfully", updatedBudget});
    } catch (error) {
        console.error("Update budget error:", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
}

export const deleteBudget = async(req,res)=>{
    const {id} = req.params;

    try {
        const userId = req.user.id;
        const deletedBudget = await Budget.findOneAndDelete({_id:id, userId});
        if(!deletedBudget){
            return res.status(404).json({message: "Budget not found"});
        }

        await Expense.deleteMany({
            userId,
            category: deletedBudget.category,
            date: {
                $gte: new Date(deletedBudget.startDate),
                $lte: new Date(deletedBudget.endDate)
            }
        });
        
        return res.status(200).json({message: "Budget deleted successfully"});
    } catch (error) {
        console.error("Delete budget error:", error.message);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    }
}
