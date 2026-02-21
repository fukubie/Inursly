import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import "./DoctorDetails.css";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book-appointment/${id}`
    : "";

  useEffect(() => {
    axios.get(`/doctors/${id}`)
      .then((res) => {
        const data = res.data;
        data.clinics = typeof data.clinics === "string" ? JSON.parse(data.clinics) : data.clinics || [];
        data.reviews = typeof data.reviews === "string" ? JSON.parse(data.reviews) : data.reviews || [];
        data.availability = typeof data.availability === "string" ? JSON.parse(data.availability) : data.availability || [];
        setDoctor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor details:", err);
        setLoading(false);
      });
  }, [id]);

  const handleBook = (type) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    navigate(isLoggedIn ? `/${type}/${id}` : "/login");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!doctor) return <div className="not-found">Doctor not found</div>;

  const satisfaction = doctor.reviews.length > 0 ? 100 : 0;

  return (
    <div className="doctor-details-layout">
      <div className="main-column">
        {/* Doctor Profile */}
        <div className="doctor-profile">
              <img src={doctor.image_url} alt={doctor.name} className="doctor-photo" />
              <div className="doctor-details-info">
                <h2>{doctor.name}</h2>
                <p className="title">{doctor.specialties}</p>
                <p className="bio">{doctor.bio}</p>
                <div className="summary-info">
                  <span><strong>Experience</strong><br />{doctor.exp} Years</span>
                  <span><strong>Satisfied Patients</strong><br />100% ({doctor.reviews.length})</span>
                </div>
              </div>
          </div>

        {/* Reviews Section */}
   {/* Reviews Section */}
    <div className="reviews-section">
        <h3>⭐ {doctor.name}'s Reviews ({doctor.reviews.length})</h3>
        <div className="review-summary">
          <div className="review-circle">{satisfaction}%</div>
          <p className="review-highlight">Satisfied out of {doctor.reviews.length} patients</p>
        </div>
        <ul className="ratings-list">
          <li>Doctor Checkup <span>100%</span></li>
          <li>Clinic Environment <span>100%</span></li>
          <li>Staff Behaviour <span>100%</span></li>
        </ul>

        {doctor.reviews.length > 0 && (
          <div className="patient-comment">
            <p>“{doctor.reviews[0].comment}”</p>
            <p className="comment-meta">
              Verified patient{doctor.reviews[0].patient_name ? `: ${doctor.reviews[0].patient_name.slice(0, 1)}** ***${doctor.reviews[0].patient_name.slice(-1)}` : ""}
              {doctor.reviews[0].daysAgo != null ? ` • ${doctor.reviews[0].daysAgo} days ago` : ""}
            </p>
          </div>
        )}

        {doctor.reviews.length > 1 && (
          <button className="read-more-btn">Read all reviews</button>
        )}
    </div>


      
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* QR code – scan to open this doctor's booking page */}
        <div className="consult-card qr-card">
          <h4 className="consult-heading">📱 Book with QR code</h4>
          <p className="qr-hint">Scan to open this doctor&apos;s booking page</p>
          {bookingUrl && (
            <div className="qr-wrap">
              <QRCodeSVG value={bookingUrl} size={140} level="M" includeMargin />
            </div>
          )}
        </div>

        <div className="consult-card">
          <h4 className="consult-heading">🖥️ Online Video Consultation</h4>
          <div className="consult-group">
            <p><strong>Fee:</strong> ${doctor.online_fee}</p>
            <p><strong>Address:</strong> Use phone/laptop for video call</p>
            <p className="available">Available today</p>
            <p><strong>09:00 AM - 11:00 PM</strong></p>
          </div>
          <button className="btn-blue" onClick={() => handleBook("book-video")}>
            Book Video Consultation
          </button>
        </div>

        {doctor.clinics && doctor.clinics.map((clinic, i) => (
          <div className="consult-card" key={i}>
            <h4 className="consult-heading">🏥 {clinic.clinic_name}</h4>
            <div className="consult-group">
              <p><strong>Fee:</strong> ${clinic.clinic_fee}</p>
              <p><strong>Address:</strong> 📍 {clinic.clinic_name}</p>
              <p className="available">Available today</p>
              <p><strong>04:00 PM - 11:00 PM</strong></p>
            </div>
            <button className="btn-orange" onClick={() => handleBook("book-appointment")}>
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDetails;
