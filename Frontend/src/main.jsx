import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          width: "100%",
          maxWidth: "320px",
          margin: "0 auto",
          padding: "8px 10px",
          fontSize: "0.8rem",
          borderRadius: "6px",
        }}
        style={{
          width: "100%",
          padding: "0 8px",
        }}
      />
    </GoogleOAuthProvider>
  </StrictMode>
);
