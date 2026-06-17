import { analyzeSimpleExpenses, analyzeTransportExpenses } from "../service/AiAnalyzer.js";
import Expense from "../model/expense.model.js";
import User from "../model/user.model.js";
import TripExpenses from "../model/tripeExpenses.js";
import { sendMail } from "../config/nodeMailer.js";
import { monthlyReportTemplate } from "../config/EmailTemplate.js";

// Helper: Get expenses for a specific user and month
const getExpensesByUserAndMonth = async (userId, month, year) => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    
    return await Expense.find({
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: -1 });
};

const getTripsByMonth = async (userID, month, year) => {
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    
    const trips = await TripExpenses.find({
        userId: userID,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ createdAt: -1 });
    
    return trips;
}


// Generate reports for all users with simple expenses (called by cron)
const generateAllSimpleReports = async () => {
    try {
        
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

        // Get all users
        const users = await User.find({userType:'simple'});
        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            try {
                // Get user's expenses
                const expenses = await getExpensesByUserAndMonth(user._id, lastMonth, lastYear);
                
                if (expenses.length === 0) {
                    console.log(`No expenses for user ${user.name}, skipping...`);
                    continue;
                }

                // Analyze
                const analysis = await analyzeSimpleExpenses(
                    expenses, 
                    monthNames[lastMonth], 
                    lastYear, 
                    user.name
                );

                if (!analysis.success) {
                    console.error(`AI analysis failed for user ${user.name}`);
                    failCount++;
                    continue;
                }

                // Send email
                const emailContent = monthlyReportTemplate({
                    userName: user.name,
                    month: monthNames[lastMonth],
                    year: lastYear,
                    analysis: analysis.analysis,
                    stats: analysis.stats,
                    reportType: 'personal'
                });

                
                await sendMail({
                    from: process.env.SENDER_EMAIL,
                    to: user.email,
                    subject: `Your Monthly Expense Report - ${monthNames[lastMonth]} ${lastYear}`,
                    html: emailContent,
                });
                successCount++;

            } catch (error) {
                console.error(`Failed to send report to ${user.name}:`, error.message);
                failCount++;
            }
        }

        return { success: successCount, failed: failCount };

    } catch (error) {
        throw error;
    }
};

const generateAllTransportReports = async () => {
       try {
        
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

        const users = await User.find({ userType: 'transport' });
        let successCount = 0;
        let failCount = 0;

        for(const user of users){
            try {
                console.log(`\n[${user.name}] Starting report generation...`);
                
                const TripExpenses = await getTripsByMonth(user._id, lastMonth, lastYear);
                
                if(TripExpenses.length === 0){
                    console.log(`[${user.name}] No trips found, skipping...`);
                    continue;
                }
                
                console.log(`[${user.name}] Found ${TripExpenses.length} trips. Analyzing with AI...`);
                
                const analysis = await analyzeTransportExpenses(
                    TripExpenses,
                    monthNames[lastMonth],
                    lastYear,
                    user.name
                );

                if(!analysis.success){
                    console.error(`[${user.name}] AI analysis failed`);
                    failCount++;
                    continue;
                }

                console.log(`[${user.name}] Sending email to ${user.email}...`);

                const emailContent = monthlyReportTemplate({
                    userName: user.name,
                    month: monthNames[lastMonth],
                    year: lastYear,
                    analysis: analysis.analysis,
                    stats: analysis.stats,
                    reportType: 'business'
                });

                await sendMail({
                    from: process.env.SENDER_EMAIL,
                    to: user.email,
                    subject: `Your Monthly Transport Report - ${monthNames[lastMonth]} ${lastYear}`,
                    html: emailContent,
                });
                
                console.log(`[${user.name}] ✅ Email sent successfully!`);
                successCount++;
            } catch (error) {
                console.error(`[${user.name}] ❌ Error:`, error.message);
                failCount++;
            }
        }
        
        return { success: successCount, failed: failCount };
       } catch (error) {
        throw error;
       }
}

export {
    generateAllSimpleReports,
    generateAllTransportReports
};