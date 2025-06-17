import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./component/Login/Loginpage";
import Dashboard from "./component/Dashboard/Dashboard";
import Transactiondetails from "./component/Report/Transactiondetails";
import Header from "./component/Header/Header";
import Footer from "./component/Footer/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    if (username === "admin" && password === "#w@seem123#") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");

      toast.success("Login Successful!", {
        className: "custom-toast",
        progressClassName: "custom-progress",
        icon: (
          <span
            style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#ffff",
              color: "#50698d",
              textAlign: "center",
              lineHeight: "24px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            ✔
          </span>
        ),
      });
    } else {
      toast.error("Invalid Credentials!", {
        className: "custom-toast",
        progressClassName: "custom-progress",
        icon: (
          <span
            style={{
              display: "inline-block",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#ffff",
              color: "#50698d",
              textAlign: "center",
              lineHeight: "24px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            X
          </span>
        ),
      });
    }
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  const ProtectedLayout = ({ children }) => (
    <>
      <Header onLogout={handleLogout} />
      <main>{children}</main>
      {/* <Footer /> */}
    </>
  );

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/transactions"
          element={
            isAuthenticated ? (
              <ProtectedLayout>
                <Transactiondetails />
              </ProtectedLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
