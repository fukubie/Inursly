import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
// ===================== Add task 18 imports here =====================

function Login({ setIsLoggedIn }) {
  // State for from fields and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // On a component mount: Redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/"); //Redirect to homepage if already Logged in
    }
  }, [navigate]);

  //Handles from submission and sends Login requests to backend
  const handleLogin = async (e) => {
    e.preventDefault(); //Prevent default from behavior

    try {
      const res = await axios.post("/login", {
        email,
        password,
      });

      // On successful Login: store session and navigate
      if (res.data.success) {
        localStorage.setItem("isLoggedIn", "true"); //Save Login state
        localStorage.setItem("userId", res.data.userId); //Save user ID
        setIsLoggedIn(true); //Update parent state
        navigate("/");
      }
    } catch (err) {
      // Handle failed Login
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2 className="title">Login</h2>

        {/* Login form */}
        <form onSubmit={handleLogin} className="form-box">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            className="input"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            className="input"
          />
          <button type="submit" className="form-btn">Login</button>
          {/* Error message display */}
          {error && (
            <div className="error-msg">
              <span>{error}</span>
              <span className="close-btn" onClick={() => setError("")}>
                x
              </span>
            </div>
          )}

          {/* Static UI element for password reset (not functional) */}
          <p className="page-link">
          <span className="page-link-label">Forgot Password?</span>
          </p>
        </form>
        {/* Signup redirect */}
        <p className="sign-up-label">
          Don't have an account? <a href="/signup" className="sign-up-link">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
