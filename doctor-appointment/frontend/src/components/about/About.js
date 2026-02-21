import React, { useState } from "react";
import { motion } from "framer-motion";
import "./About.css";

const stats = [
  { icon: "🏙️", count: "50+", label: "Cities in the US", color: "#e3f5ff", hoverColor: "#b8e1ff" },
  { icon: "📘", count: "300K+", label: "Followers", color: "#e3f9ff", hoverColor: "#b8e8ff" },
  { icon: "📲", count: "2M+", label: "App Installs", color: "#e3f9e5", hoverColor: "#b8e8ba" },
  { icon: "👨‍⚕️", count: "40,000+", label: "Verified Doctors", color: "#fff4e3", hoverColor: "#ffe0b8" },
  { icon: "🎥", count: "3M+", label: "Subscribers", color: "#ffe3e3", hoverColor: "#ffb8b8" },
];

const About = () => {
  const [activeTab, setActiveTab] = useState("mission");
  const [hoveredStat, setHoveredStat] = useState(null);

  return (
    <div className="about-us-container">
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Transforming Healthcare in the <span className="highlight">United States</span></h1>
        <p>
          Inursly is revolutionizing healthcare access by connecting millions of patients
          with trusted medical professionals across the US through our digital platform.
        </p>
        <motion.button className="cta-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Join Our Mission
        </motion.button>
      </motion.div>

      <div className="tabs-container">
        {["mission", "vision", "values"].map((tab) => (
          <motion.button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab === "mission" && "Our Mission"}
            {tab === "vision" && "Our Vision"}
            {tab === "values" && "Our Values"}
          </motion.button>
        ))}
      </div>

      <motion.div className="tab-content" key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {activeTab === "mission" && (
          <>
            <h2>Our Mission</h2>
            <p>
              To democratize healthcare access across the United States by leveraging technology to connect
              patients with medical professionals, regardless of location or background. We're committed to making
              quality healthcare affordable, accessible, and convenient for every American.
            </p>
            <p>
              Through our platform, we've already facilitated millions of consultations. We continue to innovate
              and expand our services to reach underserved communities nationwide.
            </p>
          </>
        )}
        {activeTab === "vision" && (
          <>
            <h2>Our Vision</h2>
            <p>
              We envision a America where no one has to choose between their health and other basic needs.
              A future where telemedicine and easy booking are the first point of contact for healthcare,
              reducing pressure on hospitals while improving outcomes nationwide.
            </p>
            <p>
              We aim to be a leading healthcare platform in the US, serving millions of patients annually
              with a growing network of verified healthcare providers and clinics.
            </p>
          </>
        )}
        {activeTab === "values" && (
          <>
            <h2>Our Values</h2>
            <p><strong>Patient First:</strong> Every decision we make begins with what's best for our patients.</p>
            <p><strong>Integrity:</strong> We maintain the highest ethical standards in all our interactions.</p>
            <p><strong>Innovation:</strong> We constantly push boundaries to solve healthcare challenges.</p>
            <p><strong>Compassion:</strong> We treat every user with empathy and understanding.</p>
            <p><strong>Excellence:</strong> We strive for the highest quality in everything we do.</p>
          </>
        )}
      </motion.div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            className="stat-box"
            style={{ background: hoveredStat === idx ? stat.hoverColor : stat.color }}
            whileHover={{ scale: 1.05 }}
            onMouseEnter={() => setHoveredStat(idx)}
            onMouseLeave={() => setHoveredStat(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.count}</h3>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="testimonials">
        <h2>What People Say About Us</h2>
        <div className="testimonial-grid">
          <div className="testimonial">
            <p className="testimonial-text">
              "Inursly made it easy to find and book a doctor when I needed one. The video consultation was seamless
              and the prescription arrived quickly."
            </p>
            <div className="testimonial-author">
              <img src="/img/fem.svg" alt="User" />
              <div className="author-info">
                <h4>Sarah M.</h4>
                <p>Patient, California</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <p className="testimonial-text">
              "As a doctor, I appreciate how Inursly has expanded my reach to patients in more areas while
              maintaining professional standards."
            </p>
            <div className="testimonial-author">
              <img src="/img/male.svg" alt="User" />
              <div className="author-info">
                <h4>Dr. James L.</h4>
                <p>Cardiologist, Texas</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <p className="testimonial-text">
              "Reliable, affordable, and saves us so much time. My family uses Inursly for all our healthcare needs."
            </p>
            <div className="testimonial-author">
              <img src="/img/fem.svg" alt="User" />
              <div className="author-info">
                <h4>Emily R.</h4>
                <p>Patient, New York</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
