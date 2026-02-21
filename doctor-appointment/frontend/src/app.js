import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import DoctorSignup from "./components/signup/DoctorSignup";
import ClinicSignup from "./components/signup/ClinicSignup";
import About from "./components/about/About";
import DoctorDetails from "./components/doctorDetails/DoctorDetails";
import BookAppointments from "./components/bookAppointment/BookAppointment";
import ShowAppointments from "./components/showAppointment/ShowAppointment";
import Logout from "./components/login/Logout";


function App() {

  //Track Login state based on localStorage value
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") ==="true"
  );

  //Sync Login state on component mount
  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn")==="true";
    setIsLoggedIn(stored);
  }, []);

  return (
    <Router>
      <div className="App">
        {/*render header on all page*/}
        <Header isLoggedIn={isLoggedIn} />

        {/*Define all routes in the application */}
        <div className="main">
        <Routes>
          {/*Login route - Pass setIsLoggedIn to update login state */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn}/>}/>

          {/*Consitionally render About page or redirect to login */}
          <Route 
          path="/about"
          element={isLoggedIn ? <About />: <Login setIsLoggedIn={setIsLoggedIn}/>}
            />

            {/*Show all appointments */}
            <Route path="/appointments" element={<ShowAppointments/>} />

            <Route path="/signup" element={<Signup/>} />
            <Route path="/signup/doctor" element={<DoctorSignup/>} />
            <Route path="/signup/clinic" element={<ClinicSignup/>} />

            {/*Home page */}
            <Route path="/" element={<Home />} />

            {/*Doctor details page (dynamic route) */}
            <Route path="/doctor/:id" element={<DoctorDetails/>} />

            {/*Book an appointment (dynamic route) */}
            <Route path="/book-appointment/:doctorId" element={<BookAppointments/>} />

            {/*Logout route: Pass setIsLoggedIn to clear login state */}
          <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
