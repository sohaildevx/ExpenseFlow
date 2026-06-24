import React, {useContext, createContext, useState} from 'react'
import axios from '../config/Axios'

const SimpleExpenseContext = createContext();


export const SimpleExpenseContextProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [simpleUser, setSimpleUser] = useState(null);
    const [budget, setBudget] = useState(null);

    const parseError = (error) => {
        const data = error.response?.data;
        if (data?.message) return data.message;
        if (data?.errors?.length) return data.errors.map(e => e.msg).join(', ');
        return 'Something went wrong. Please try again.';
    };

    const createExpense = async(expenseData)=>{
        try {
            const response = await axios.post('/expense',expenseData);
            setSimpleUser(response.data.user);
            setLoading(true);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Create expense error:", error);
            return {success:false, message: parseError(error)};
        }
    }

    const getAllSimpleExpenses = async()=>{
        setLoading(true); 
        try {
            const response = await axios.get('/expense');
            setExpenses(response.data.expenses);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Get expenses error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false); 
        }
    }

    const deleteExpense = async(expenseId)=>{
        setLoading(true)
         try {
            const response = await axios.delete(`/expense/${expenseId}`);
            return {success:true, data: response.data};
         } catch (error) {
            console.error("Delete expense error:", error);
            return {success:false, message: parseError(error)};
         }finally{
            setLoading(false);
         }
    }

    const updateExpense = async(expenseId, expenseData)=>{
        setLoading(true)
        try {
            const response = await axios.put(`/expense/${expenseId}`, expenseData);
            setSimpleUser(response.data.user);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Update expense error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }

    const scanReceipt = async(file)=>{
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append('receipt', file);
            const response = await axios.post('/expense/scan-receipt', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Scan receipt error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }

    const uploadReceiptToExpense = async(expenseId, file)=>{
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append('receipt', file);
            const response = await axios.post(`/expense/${expenseId}/receipt`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Upload receipt error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }


    // Budget related operations
    const AddBudget = async(budgetData)=>{
        setLoading(true)
        try {
            const response = await axios.post('/budget/addBudget', budgetData);
            setBudget(response.data.budget);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Add budget error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }

    const getBudget = async(budgetId)=>{
        setLoading(true);
        try {
            const response = await axios.get(`/budget/getBudget/${budgetId}`);
            setBudget(response.data.budget);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Get budget error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }

    const getAllBudgets = async()=>{
        setLoading(true);
        try {
            const response = await axios.get('/budget/getAllBudgets');
            setBudget(response.data.budgets);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Get budgets error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }

    const deleteBudget = async(budgetId)=>{
        setLoading(true);
        try {
            const response = await axios.delete(`/budget/deleteBudget/${budgetId}`);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Delete budget error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }

    const updateBudget = async(budgetId, budgetData)=>{
        setLoading(true);
        try {
            const response = await axios.put(`/budget/updateBudget/${budgetId}`, budgetData);
            setBudget(response.data.updatedBudget);
            return {success:true, data: response.data};
        } catch (error) {
            console.error("Update budget error:", error);
            return {success:false, message: parseError(error)};
        } finally {
            setLoading(false);
        }
    }


    const value = {
        createExpense,
        getAllSimpleExpenses,
        deleteExpense,
        updateExpense,
        scanReceipt,
        uploadReceiptToExpense,
        AddBudget,
        getBudget,
        getAllBudgets,
        deleteBudget,
        updateBudget,
        loading,
        simpleUser,
        expenses,
        budget
    }
  return (
    <SimpleExpenseContext.Provider value={value}>
      {children}
    </SimpleExpenseContext.Provider>
  )
}
export const useSimpleExpense = () => {
    const context = useContext(SimpleExpenseContext);
    if (!context) {
        throw new Error('useSimpleExpense must be used within a SimpleExpenseContextProvider');
    }
    return context;
}
