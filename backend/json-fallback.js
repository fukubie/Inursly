const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

let doctors = [];
let doctorClinic = [];
let specialties = [];
let doctorSpecialties = [];
let availability = [];
let reviews = [];
let patients = [];
let appointments = [];
let nextPatientId = 1;
let nextAppointmentId = 1;

function stripQuotes(s) {
  if (typeof s !== "string") return s;
  return s.replace(/^'|'$/g, "").trim();
}

function getSpecialtyNames(doctorId) {
  const specIds = doctorSpecialties
    .filter((ds) => String(ds.doctor_id) === String(doctorId))
    .map((ds) => ds.specialty_id);
  return specIds
    .map((id) => {
      const s = specialties[Number(id) - 1];
      return s ? s.name : "";
    })
    .filter(Boolean)
    .join(", ");
}

function getClinics(doctorId) {
  return doctorClinic
    .filter((c) => String(c.doctor_id) === String(doctorId))
    .map((c) => ({
      clinic_name: stripQuotes(c.clinic_name),
      clinic_fee: parseFloat(String(c.clinic_fee)) || 0,
    }));
}

function getDoctorReviews(doctorId) {
  return reviews
    .filter((r) => String(r.doctor_id) === String(doctorId))
    .map((r) => ({
      rating: Number(r.rating) || 0,
      comment: stripQuotes(r.comment),
      patient_name: "Patient",
      daysAgo: 0,
    }));
}

function getAvailability(doctorId) {
  return availability
    .filter((a) => String(a.doctor_id) === String(doctorId))
    .map((a) => ({
      available_date: stripQuotes(a.available_date),
      start_time: stripQuotes(a.start_time),
      end_time: stripQuotes(a.end_time),
    }));
}

function loadData() {
  const dataPath = path.join(__dirname, "data", "appointment_data.json");
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  doctors = (raw.doctors || []).map((d, i) => ({
    id: i + 1,
    name: stripQuotes(d.name),
    email: stripQuotes(d.email),
    bio: stripQuotes(d.bio),
    image_url: stripQuotes(d.image_url || d.exp || "/img/doc.png"),
    exp: stripQuotes(d.exp) || "5",
    total_patients: d.total_patients || "0",
    online_fee: d.online_fee || "0",
    visit_fee: d.visit_fee || "0",
    specialties: "",
  }));
  doctorClinic = raw.doctor_clinic || [];
  specialties = raw.specialties || [];
  doctorSpecialties = raw.doctor_specialties || [];
  availability = raw.availability || [];
  reviews = raw.reviews || [];
  doctors.forEach((d) => {
    d.specialties = getSpecialtyNames(d.id);
  });
  patients = [];
  appointments = [];
  nextPatientId = 1;
  nextAppointmentId = 1;
  return true;
}

function registerRoutes(app) {
  app.get("/doctors", (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || "").trim().toLowerCase();
    let list = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      bio: d.bio,
      image_url: d.image_url,
      exp: d.exp,
      specialties: d.specialties,
      online_fee: d.online_fee,
      visit_fee: d.visit_fee,
    }));
    if (search) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          (d.specialties && d.specialties.toLowerCase().includes(search))
      );
    }
    const start = (page - 1) * limit;
    res.json(list.slice(start, start + limit));
  });

  app.get("/doctors/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const d = doctors.find((doc) => doc.id === id);
    if (!d) return res.status(404).json({ error: "Doctor not found" });
    res.json({
      ...d,
      clinics: getClinics(id),
      reviews: getDoctorReviews(id),
      availability: getAvailability(id),
    });
  });

  app.post("/signup", (req, res) => {
    const { username, password, dob, email } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (patients.some((p) => p.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: "Could not hash password" });
      const id = nextPatientId++;
      patients.push({ id, username: username || "", dob: dob || "", email, password: hash });
      res.status(201).json({ message: "User registered successfully", userId: id });
    });
  });

  app.post("/login", (req, res) => {
    const { email, password } = req.body || {};
    const user = patients.find((p) => p.email === email);
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.status(401).json({ success: false, message: "Invalid credentials" });
      res.json({ success: true, userId: String(user.id) });
    });
  });

  app.post("/signup/doctor", (req, res) => {
    const { name, email, password, bio, exp, online_fee, visit_fee } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: "Could not hash password" });
      const id = doctors.length + 1;
      doctors.push({
        id,
        name,
        email,
        password: hash,
        bio: bio || "",
        image_url: "/img/doc.png",
        exp: exp != null ? String(exp) : "0",
        total_patients: "0",
        online_fee: online_fee != null ? String(online_fee) : "0",
        visit_fee: visit_fee != null ? String(visit_fee) : "0",
        specialties: "",
      });
      res.status(201).json({ message: "Doctor registered successfully", doctorId: id });
    });
  });

  app.post("/signup/clinic", (req, res) => {
    res.status(201).json({ message: "Clinic registered successfully (demo mode)", clinicId: 1 });
  });

  app.get("/appointments/user/:userId", (req, res) => {
    const list = appointments.filter(
      (a) => a.patientId === req.params.userId && a.status !== "cancelled"
    );
    res.json(list);
  });

  app.delete("/appointments/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: "Appointment not found" });
    appointments[idx].status = "cancelled";
    res.json({ message: "Appointment deleted successfully" });
  });

  app.get("/appointment", (req, res) => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.json({ bookedTimes: [] });
    const booked = appointments
      .filter(
        (a) =>
          String(a.doctorId) === String(doctorId) &&
          a.date === date &&
          a.status !== "cancelled"
      )
      .map((a) => a.time);
    res.json({ bookedTimes: booked });
  });

  app.post("/book-appointment", (req, res) => {
    const { patientId, doctorId, date, time, reason } = req.body || {};
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: "Patient, doctor, date, and time are required." });
    }
    const doctor = doctors.find((d) => String(d.id) === String(doctorId));
    const id = nextAppointmentId++;
    appointments.push({
      id,
      patientId: String(patientId),
      doctorId: String(doctorId),
      doctor_name: doctor ? doctor.name : "Unknown",
      appointment_date: date,
      time_slot: time,
      reason: reason || "",
      status: "confirmed",
    });
    res.status(200).json({ message: "Appointment booked successfully", appointmentId: id });
  });
}

module.exports = { loadData, registerRoutes };
