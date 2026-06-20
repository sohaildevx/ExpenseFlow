import express from 'express';
import router from './routes/user.routes.js';  
import tripRouter from './routes/trip.routes.js';
import razorpayRouter from './routes/razorpay.Route.js';
import expenseRouter from './routes/expense.route.js';
import BudgetRoute from './routes/budget.route.js';
import reportRouter from './routes/report.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();


const allowedOrigins = [
  'http://localhost:5173',
  process.env.LOCALFRONTEND,
  process.env.FRONTEND
].filter(Boolean); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {

        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('Expense Tracker Backend is running');
});
// app.use(express.text({ type: ['text/*'] })); // Commented out - was interfering with JSON body parsing

app.use('/user', router);
app.use('/trip', tripRouter);
app.use('/razorpay', razorpayRouter);
app.use('/expense', expenseRouter);
app.use('/budget', BudgetRoute);
app.use('/report', reportRouter);

export default app;