import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

function Header({ isLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="main-header">
      <div className="logo-section">
        <Link to="/" className="logo-link">
          <img src="/img/logo.png" alt="Inursly" className="logo-icon" />
          <span className="app-title">Inursly</span>
        </Link>
      </div>

      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/signup/doctor" onClick={() => setMenuOpen(false)}>For Doctors</Link></li>
        <li><Link to="/signup/clinic" onClick={() => setMenuOpen(false)}>For Clinics</Link></li>
        {isLoggedIn ? (
          <>
            <li><Link to="/appointments" onClick={() => setMenuOpen(false)}>My Appointments</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/logout" onClick={() => setMenuOpen(false)}>Logout</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
            <li><Link to="/signup" onClick={() => setMenuOpen(false)}>Sign up</Link></li>
          </>
        )}
      </ul>
      <button type="button" className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        {menuOpen ? "✕" : "☰"}
      </button>
    </nav>
  );
}

export default Header;
