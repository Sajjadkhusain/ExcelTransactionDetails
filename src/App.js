import React, { useState } from "react";
import "./App.css";
import LoginPage from "./component/Loginpage";
import Transactiondetails from "./component/Transactiondetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username, password) => {
    if (username === "admin" && password === "#w@seem123#") {
      setIsAuthenticated(true);
      toast.success("Login successful!", {
        style: {
          backgroundColor: "#50698d",
          color: "#fff",
        },
        progressStyle: {
          background: "#ffffff",
        },
        hideProgressBar: false,
        icon: () => (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ccc",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
            }}
          >
            <span style={{ color: "#00cc99", fontSize: "16px" }}>
              <span style={{ color: "black" }}>✓</span>
            </span>
          </span>
        ),
      });
    } else {
      toast.error("Invalid credentials", {
        style: {
          backgroundColor: "#50698d",
          color: "#fff",
        },
        progressStyle: {
          background: "#ffffff",
        },
        hideProgressBar: false,
        icon: () => (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ccc",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
            }}
          >
            <span style={{ color: "#00cc99", fontSize: "16px" }}>
              <span style={{ color: "black" }}>X</span>
            </span>
          </span>
        ),
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  return (
    <>
      {isAuthenticated ? (
        <Transactiondetails onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
