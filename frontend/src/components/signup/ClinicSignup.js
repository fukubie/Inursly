import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./DoctorSignup.css";

export default function ClinicSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", address: "", phone: "", email: "" });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/signup/clinic", form);
      setMessage(res.data.message || "Clinic registered successfully.");
      setSuccess(true);
      setForm({ name: "", address: "", phone: "", email: "" });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || "Registration failed.");
      setSuccess(false);
    }
  };

  return (
    <div className="signup-page clinic-signup-page">
      <div className="signup-card">
        <h1>Clinic Registration</h1>
        <p className="subtitle">Register your clinic on Inursly</p>
        <form onSubmit={handleSubmit} className="signup-form">
          <input type="text" name="name" placeholder="Clinic name *" value={form.name} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <button type="submit" className="btn-submit">Register Clinic</button>
        </form>
        {message && <p className={success ? "message success" : "message error"}>{message}</p>}
        <p className="login-link"><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}
