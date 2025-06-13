import React, { useState } from "react";

const Loginpage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
