import React, { useState } from "react";
import Avatar from "react-avatar";
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="custom-card">
        <div className="mb-3 text-center">
          <Avatar
            src={`${process.env.PUBLIC_URL}/img/img.jpg`}
            round={true}
            size="100"
            alt="Avatar"
            style={{ boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control mb-3"
            required
          />
          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#50698d" }}
          >
            <span style={{ color: "#fff" }}>Login</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
