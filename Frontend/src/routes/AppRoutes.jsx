import { Routes, Route } from "react-router-dom";
import { Login, Home, Dashboard, ForgotPage, SignUp,AddTrip, View, EditTrip, Supporters, AllTrips, VerifyEmail } from "../pages/pages.js";
import {ExpenseDashboard, AddExpense, Budget, AllExpensesPage} from '../../Expense/page.js';
import ProtectedRoute from "./ProtectedRoute.jsx";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/forgot"
          element={
              <ForgotPage />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-trip"
          element={
            <ProtectedRoute>
              <AddTrip />
            </ProtectedRoute>
          }
        />

        <Route
         path="/trip/:id"
         element={
          <ProtectedRoute>
            <View />
          </ProtectedRoute>
         }
        />  

        <Route
         path="/edit/:id"
         element={
          <ProtectedRoute>
            <EditTrip />
          </ProtectedRoute>
         }
        />

        <Route path='/supporters' element={
            <Supporters />
        }/>
        <Route path='/expense-dashboard' element={
          <ProtectedRoute>
            <ExpenseDashboard />
          </ProtectedRoute>
        }/>

        <Route path='/add-expense' element={
          <ProtectedRoute>
            <AddExpense />
          </ProtectedRoute>
        }/>

        <Route path="/budget" element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        }
        />
        <Route path="/all-trips" element={
          <ProtectedRoute>
            <AllTrips />
          </ProtectedRoute>
        }
        />

        <Route path="/expenses" element={
          <ProtectedRoute>
            <AllExpensesPage />
          </ProtectedRoute>
        }
        />
      </Routes>

    </div>
  );
};

export default AppRoutes;
