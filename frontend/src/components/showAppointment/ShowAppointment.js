import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

// ===================== Add task 26 imports here ===================== 


export default function ShowAppointments() {

  const[appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(()=>{
    if(!userId){
      navigate("/login");
      return;
    }

    axios
      .get(`/appointments/user/${userId}`)
      .then((res)=> setAppointments(res.data))
      .catch((err)=> console.error("Error fetching appointments:", err));
  }, [userId, navigate]);

  const handleDelete = (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return; // ⛔ STOP if user cancels
    }
  
    axios
      .delete(`/appointments/${appointmentId}`)
      .then(() => {
        setAppointments((prev) =>
          prev.filter((appt) => appt.id !== appointmentId)
        );
      })
      .catch((err) => {
        console.error("Failed to delete appointment:", err);
        alert("Deletion failed");
      });
  };
  
  return(
      <div className="appointments-container">
        <h1>Your Appointments</h1>
        {appointments.length ===0 ? (
          <p>No appointments found.</p>
        ): (
          <ul className="appointment-list">
            {appointments.map((appt) => (
              <li key={appt.id} className="appointment-card">
                  <div>
                    <p><strong>Doctor:</strong> {appt.doctor_name}</p>
                    <p><strong>Date:</strong> {new Date(appt.appointment_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong>{appt.time_slot.slice(0,5)}</p>
                    <p><strong>Reason:</strong>{appt.reason}</p>
                  </div>
                  <button className="delete-btn" onClick={()=> handleDelete(appt.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
  );
}