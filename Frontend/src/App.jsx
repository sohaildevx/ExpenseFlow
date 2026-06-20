import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { RazorpayProvider } from "./context/razorpayContext";
import { SimpleExpenseContextProvider } from "./context/SimpleExpenseContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <SimpleExpenseContextProvider>
            <RazorpayProvider>
              <AppRoutes />
            </RazorpayProvider>
          </SimpleExpenseContextProvider>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
