import React, { useState } from "react";
import "./Login.css";

const Loginpage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate 2 seconds loading before calling onLogin
    setTimeout(() => {
      onLogin(username, password);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 dark-bg-gradient ">
      <div className="custom-card text-center p-4">
        <div className="mb-3">
          <span>LOGIN</span>
          {/* <img
            src={`${process.env.PUBLIC_URL}/img/img2.png`}
            alt="Logo"
            height={150}
            style={{ borderRadius: "10px" }}
          /> */}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person-fill icon-color"></i>
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-lock-fill" style={{ color: "#a99696d9" }}></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              disabled={isLoading}
            />
            {password && (
              <button
                className="btn btn-outline-secondary border-start-0"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#ced4da",
                  color: " #a99696",
                }}
                disabled={isLoading}
              >
                <i
                  style={{ fontSize: "18px" }}
                  className={`bi ${
                    showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                  }`}
                ></i>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn w-100 login-button"
            style={{
              backgroundColor: "#a99696d9",
              color: "#fff",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              position: "relative",
              transition: "all 0.3s ease",
              fontSize: "19px",
              fontWeight: "600",
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="fancy-spinner">
                  <span className="spinner-dot"></span>
                  <span className="spinner-dot"></span>
                  <span className="spinner-dot"></span>
                </span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Loginpage;
