import React, { useState } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
const Header = ({ onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div>
      <header className="navbar">
        <div className="logo">TECHNO FORCAST</div>
        <nav className="nav-links">
          <button
            style={{
              backgroundColor: "darkgray",
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
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            <i className="fa fa-home" style={{ fontSize: "16px" }}></i>
            <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
              Home
            </Link>
          </button>

          <div
            className="dropdown"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button
              className="dropdown-toggle nav-item btn"
              style={{
                backgroundColor: "darkgray",
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
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              Reports
            </button>
            <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
              <Link to="/stock-rajester" className="dropdown-item">
                Stock Rajester
              </Link>
              <Link to="/transactions" className="dropdown-item">
                Transactions
              </Link>
              <Link to="/Fps" className="dropdown-item">
                FPS
              </Link>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn"
            title="Logout"
            style={{
              backgroundColor: "darkgray",
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
            <span style={{ fontSize: "15px", fontWeight: 500 }}>Logout</span>
          </button>
        </nav>
      </header>
    </div>
  );
};

export default Header;
