import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./DoctorSignup.css";

export default function DoctorSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    exp: "",
    online_fee: "",
    visit_fee: "",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/signup/doctor", {
        ...form,
        exp: form.exp ? Number(form.exp) : undefined,
        online_fee: form.online_fee ? Number(form.online_fee) : undefined,
        visit_fee: form.visit_fee ? Number(form.visit_fee) : undefined,
      });
      setMessage(res.data.message || "Registration successful.");
      setSuccess(true);
      setForm({ name: "", email: "", password: "", bio: "", exp: "", online_fee: "", visit_fee: "" });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || "Registration failed.");
      setSuccess(false);
    }
  };

  return (
    <div className="signup-page doctor-signup-page">
      <div className="signup-card">
        <h1>Doctor Registration</h1>
        <p className="subtitle">Join Inursly as a healthcare provider</p>
        <form onSubmit={handleSubmit} className="signup-form">
          <input type="text" name="name" placeholder="Full name *" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email *" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password *" value={form.password} onChange={handleChange} required minLength={6} />
          <textarea name="bio" placeholder="Short bio" value={form.bio} onChange={handleChange} rows={3} />
          <input type="number" name="exp" placeholder="Years of experience" value={form.exp} onChange={handleChange} min={0} />
          <input type="number" name="online_fee" placeholder="Online consultation fee ($)" value={form.online_fee} onChange={handleChange} min={0} step="0.01" />
          <input type="number" name="visit_fee" placeholder="In-person visit fee ($)" value={form.visit_fee} onChange={handleChange} min={0} step="0.01" />
          <button type="submit" className="btn-submit">Register as Doctor</button>
        </form>
        {message && <p className={success ? "message success" : "message error"}>{message}</p>}
        <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
