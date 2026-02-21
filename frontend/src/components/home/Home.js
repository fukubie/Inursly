import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";
// ===================== Add task 22 imports here =====================

const LIMIT = 10;

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const navigate = useNavigate();

  const fetchDoctors = async (pageNum, search = "") => {
    try {
      const res = await axios.get("/doctors", {
        params: {
          page: pageNum,
          limit: LIMIT,
          search: search.trim(),
        },
      });

      const newDocs = res.data;

      if (pageNum === 1) {
        setDoctors(newDocs);
      } else {
        setDoctors((prev) => [...prev, ...newDocs]);
      }

      if (newDocs.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  useEffect(() => {
    fetchDoctors(page, searchQuery);
  }, [page, searchQuery]);

  const lastDoctorRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
    setHasMore(true);
    setDoctors([]); //Reset doctor list for new query
  };

  const handleCardClick = (id) => navigate(`/doctor/${id}`);

  const handleBookAppointment = (id) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    navigate(isLoggedIn ? `/book-appointment/${id}` : "/login");
  };

  return (
    <div className="home-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {doctors.map((doc, idx) => (
        <div
          className="doctor-card"
          key={doc.id}
          onClick={() => handleCardClick(doc.id)}
          ref={idx === doctors.length - 1 ? lastDoctorRef : null}
        >
          <div>
            <div className="doctor-header">
              <img src={doc.image_url} alt={doc.name} className="doctor-img" />
              <div className="doctor-info">
                <h2 className="doctor-name">{doc.name}</h2>
                <p className="doctor-role">{doc.bio}</p>
                <p className="doctor-specialties">{doc.specialties}</p>
                <div className="doctor-meta">
                  <div>
                    Experience: <strong>{doc.exp}</strong>
                  </div>
                  <div>
                    Satisfied Patients: <strong>{doc.total_patients}</strong>
                  </div>
                </div>
                <div className="consultation-section">
                  <div className="consult-box">
                    <div className="consult-title">
                      {" "}
                      Online Video Consultation
                    </div>
                    <div className="available">
                      <span className="status-dot"></span>Available Today
                    </div>
                    <div>$.{doc.online_fee}</div>
                  </div>
                  <div className="consult-box">
                    <div className="consult-title">
                      {" "}
                      Clinic Consultation Fee
                    </div>
                    <div className="available">
                      <span className="status-dot"></span>Available Today
                    </div>
                    <div>$.{doc.visit_fee}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="actions">
              <button
                className="btn-outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookAppointment(doc.id);
                }}
              >
                Video Consultation
              </button>

              <button
                className="btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookAppointment(doc.id);
                }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      ))}

      {!hasMore && !searchQuery && (
        <div className="message-box no-more">
          <p>All doctors have been loaded.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
