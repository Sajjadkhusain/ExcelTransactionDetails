import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
const Header = ({ onLogout }) => {
  return (
    <div>
      <header className="navbar">
        <div className="logo">WELCOME</div>
        <nav className="nav-links">
          <a href="/dashboard">Home</a>
          <Link to="/transactions">Reports</Link>
          {/* <a href="#about"></a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a> */}
          <button
            onClick={onLogout}
            className="btn"
            title="Logout"
            style={{
              backgroundColor: "#50698d",
              color: "#fff",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 12px",
              gap: "6px",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </nav>
      </header>
    </div>
  );
};

export default Header;
