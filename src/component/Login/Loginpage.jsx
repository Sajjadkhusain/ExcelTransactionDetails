import React, { useState } from "react";
import "./Login.css";
const Loginpage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="custom-card text-center p-4">
        <div className="mb-3">
          <img
            src={`${process.env.PUBLIC_URL}/img/img.jpg`}
            alt="Logo"
            height={150}
            style={{ borderRadius: "10px" }}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person-fill icon-color"></i>{" "}
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-lock-fill icon-color"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
            <button
              className="btn btn-outline-secondary eye-icon"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={`bi ${
                  showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"
                }`}
                style={{ color: "#50698d" }}
              ></i>
            </button>
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#50698d", color: "#fff" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Loginpage;
