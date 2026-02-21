require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4000";

app.use(cors({ origin: FRONTEND_URL || true, credentials: true }));
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "doctor_appointment",
};
if (process.env.DB_PORT) dbConfig.port = parseInt(process.env.DB_PORT, 10);
const db = mysql.createConnection(dbConfig);

const { loadData: loadJsonFallback, registerRoutes: registerJsonRoutes } = require("./json-fallback");

function registerDbRoutes() {
  app.get("/doctors", (req, res) => {
    //Get pagination and search paramesters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%`:null;
    const offset = (page - 1)*limit;

  //Base SQL query to fetch doctors with joined specialties
  let baseSql = `
     SELECT
       d.id,
       d.name,
       d.email,
       d.bio,
       d.image_url,
       d.exp,
       d.total_patients,
       d.online_fee,
       d.visit_fee,
       GROUP_CONCAT(s.name SEPARATOR ', ') AS specialties
    FROM doctors d
    JOIN doctor_specialties ds ON d.id = ds.doctor_id
    JOIN specialties s ON ds.specialty_id = s.id
  `;

  //Array to hold conditional clauses and values
  const conditions = [];
  const values = [];

  // If search query exists, filter by doctor name or specialty
  if(search){
    conditions.push("(LOWER(d.name) LIKE ? OR LOWER(s.name) LIKE ?)");
    values.push(search, search);
  }

  //Add WHERE clause if conditions exist
  if(conditions.length){
    baseSql += " WHERE " + conditions.join(" AND ");
  }

  // Add GROUP BY, LIMIT, AND OFFSET clauses for pagination
  baseSql += " GROUP BY d.id LIMIT ? OFFSET ?";
  values.push(limit, offset);

  //Excute the query
  db.query(baseSql, values, (err, results)=>{
     if(err) return res.status(500).json({error: err.message});
     res.json(results);
  });
});

//Get Single Doctor by ID

app.get("/doctors/:id", (req, res) => {
    const doctorId = req.params.id; //Extract doctor ID from the URL parameters

    // SQL query to fetch detailed doctor information
    const sql = `
      SELECT
        d.id,
        d.name,
        d.email,
        d.bio,
        d.image_url,
        d.exp,
        d.total_patients,
        d.online_fee,
        d.visit_fee,

        -- Fetch specialties as a comma-separated string
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS specialties,

        -- Fetch associated clinic details as a JSON array
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'clinic_name', dc.clinic_name,
                    'clinic_fee', dc.clinic_fee
                )
            )
            FROM doctor_clinic dc
            WHERE dc.doctor_id = d.id
        ) AS clinics,

        -- Fetch recent reviews with patient name and rating
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'rating', r.rating,
                    'comment', r.comment,
                    'patient_name', p.name,
                    'daysAgo', DATEDIFF(CURDATE(), r.id)
                )
            )
            FROM reviews r
            JOIN patients p ON r.patient_id = p.id
            WHERE r.doctor_id = d.id
            ORDER BY r.id DESC
            LIMIT 5
        ) AS reviews,

        -- Fetch upcoming availability records
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'available_date', a.available_date,
                    'start_time', a.start_time,
                    'end_time', a.end_time
                )
            )
            FROM availability a
            WHERE a.doctor_id = d.id AND a.available_date >= CURDATE()
            ORDER BY a.available_date ASC
            LIMIT 5
        ) AS availability

        FROM doctors d
        LEFT JOIN doctor_specialties ds ON d.id = ds.doctor_id
        LEFT JOIN specialties s ON ds.specialty_id = s.id
        WHERE d.id = ?
        GROUP BY d.id;
    
    
    `;

    //Excute the query
    db.query(sql, [doctorId], (err, results)=>{
        if(err){
            return res.status(500).json({error:err.message}); //Server/database error
        }

        if(results.length === 0){
            return res.status(404).json({error: "Doctor not found"}); // No doctor with this ID
        }

        // Send the result (doctor details) as JSON response
        res.json(results[0]);
    })
})

// Patient signup (bcrypt)
app.post("/signup", (req, res) => {
  const { username, password, dob, email } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Could not hash password" });
    const sql = `INSERT INTO patients (name, email, password, dob) VALUES (?, ?, ?, ?)`;
    db.query(sql, [username || "", email, hash, dob || null], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Email already registered" });
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    });
  });
});

// Patient login (bcrypt)
app.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }
  const sql = `SELECT id, password FROM patients WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.status(401).json({ success: false, message: "Invalid credentials" });
      res.json({ success: true, userId: String(user.id) });
    });
  });
});

// Doctor signup – stores bcrypt hash in doctors.password
app.post("/signup/doctor", (req, res) => {
  const { name, email, password, bio, exp, online_fee, visit_fee, specialty_id } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email, and password required" });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Could not hash password" });
    const sql = `INSERT INTO doctors (name, email, password, bio, image_url, exp, total_patients, online_fee, visit_fee)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`;
    const img = "/img/doc.png";
    const expNum = exp != null ? Number(exp) : 0;
    const onlineFee = online_fee != null ? Number(online_fee) : 0;
    const visitFee = visit_fee != null ? Number(visit_fee) : 0;
    db.query(sql, [name, email, hash, bio || "", img, expNum, onlineFee, visitFee], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Email already registered" });
        return res.status(500).json({ error: err.message });
      }
      const doctorId = result.insertId;
      if (specialty_id) {
        db.query("INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES (?, ?)", [doctorId, specialty_id], () => {});
      }
      res.status(201).json({ message: "Doctor registered successfully", doctorId });
    });
  });
});

// Clinic registration – requires clinics table (id, name, address, phone, email, created_at)
app.post("/signup/clinic", (req, res) => {
  const { name, address, phone, email } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: "Clinic name required" });
  }
  const sql = `INSERT INTO clinics (name, address, phone, email) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, address || "", phone || "", email || ""], (err, result) => {
    if (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        return res.status(501).json({ error: "Clinic registration not configured. Add a clinics table." });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Clinic registered successfully", clinicId: result.insertId });
  });
});

// ===================== Add Task 8 code here ===================== 
/**
 *  GET /appointments/user/:userId
 * Fetch all appointments for a specific user
 * - Accepts user ID as a route parameter
 * - Joins appointments with doctor details to return the doctor’s name
 * - Orders results by most recent appointment date and time
 */

app.get("/appointments/user/:userId", (req, res) =>{
    const {userId} = req.params;

    const sql = `
    SELECT
      a.id,
      a.appointment_date,
      a.time_slot,
      a.reason,
      d.name AS doctor_name
     FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_date DESC, a.time_slot ASC
    `;

    db.query(sql, [userId], (err, results) => {
        if(err) return res.status(500).json({error: err.message});
        res.json(results);
    });
});

/**
 * DELETE /appointments/:id
 * Delete a specific appointment by its ID
 * - Accepts appointment ID as a route parameter
 * - Executes a DELETE SQL query.
 */

app.delete("/appointments/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM appointments WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Appointment not found" });
        res.json({ message: "Appointment deleted successfully" });
    });
});

/**
 * GET /appointment?doctorId=&date=
 * Return booked time slots for a doctor on a given date (so the calendar can disable them).
 */
app.get("/appointment", (req, res) => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
        return res.json({ bookedTimes: [] });
    }
    const sql = `
      SELECT time_slot
      FROM appointments
      WHERE doctor_id = ? AND appointment_date = ?
    `;
    db.query(sql, [doctorId, date], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const bookedTimes = (results || []).map((r) => r.time_slot);
        res.json({ bookedTimes });
    });
});

/**
 * POST /book-appointment
 * Book a new appointment.
 * - Extracts `patientId`, `doctorId`, `date`, `time`, and `reason` from `req.body`
 * - Inserts new appointment into the `appointments` table
 */

app.post("/book-appointment", (req, res)=>{
    const{patientId, doctorId, date, time, reason}=req.body;

    if (!patientId || !doctorId || !date || !time) {
        return res.status(400).json({ error: "Patient, doctor, date, and time are required." });
    }
    const query = `INSERT INTO appointments (patient_id, doctor_id, appointment_date, time_slot, reason) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [patientId, doctorId, date, time, reason || ""], (err, result) => {
        if(err){
            console.error("Database error:", err);
            return res.status(500).json({error: "Database error"});
        }

        res.status(200).json({
            message:"Appointment booked successfully",
            appointmentId: result.insertId
        });
    });
});

} // end registerDbRoutes

//Initialize Chat model
const chatModel = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0
});

// ===================== Add Task 11 code here ===================== 
const{
    initializeVectorStore,
    getVectorStore
} = require('./chatbot-service'); //file path can be adjusted here

const{ChatPromptTemplate} = require('@langchain/core/prompts');
const{StringOutputParser} = require('@langchain/core/output_parsers');

app.post('/chat', async(req,res)=> {
    const{message} = req.body;
    console.log("chat bot");

    if(!message || typeof message !== 'string' || !message.trim()){
        return res.status(400).json({error: 'Please enter a valid message about the project.'});
    }

    const trimmedMessage = message.trim();
    const lowerMessage = trimmedMessage.toLowerCase();

    const greetingRegex = /^(hi|hello|hey|greetings|how are you| what's up)\b/i;

    if(greetingRegex.test(lowerMessage)){
        return res.json({
            reply: `Hi, I'm your API assistant. Feel free to ask me anything about the doctor appointment project!`,
            context:[],
            source: "greeting"
        });
    }
    const vectorStore = getVectorStore();
    if(!vectorStore){
        return res.status(503).json({error: 'Project data is still loading. Please try again shortly.'});
    }

    try{
        console.log(`📩 User question: "${message}"`);
        const relevantDocs = await vectorStore.similaritySearch(trimmedMessage, 5);

        if(relevantDocs.length ===0){
            return res.json({
                reply: "I couldn't find any relevant information in the project description for your question. Please ask something else.",
                context: []
            });
        }

        const projectContext = relevantDocs.map(doc => doc.pageContent).join('\n---\n');

        const strictPrompt = ChatPromptTemplate.fromPromptMessages([
            {role: "system", content: `
            You are an AI assistant for a doctor appointment API. Use ONLY the project data below to answer.

Rules:
- Only answer using the info in "Project Data".
- If data doesn't cover the question, say: "I don't have that information in the project description. Please ask something else."
- No guessing or hallucinating.

Project Data:
{projectContext}
            
            
            `}, {role: "user", content: "{question}"}
        ]);

        const messages = await strictPrompt.formatMessages({
            projectContext,
            question: trimmedMessage
        });

        const aiResponse = await chatModel.call(messages);
        const replyText = typeof aiResponse?.content === 'string'
            ? aiResponse.content
            : (aiResponse?.content?.[0]?.text ?? aiResponse?.text ?? String(aiResponse || ''));

        console.log('Response sent');

        res.json({
            reply: replyText || 'No response generated.',
            context: relevantDocs.map(doc => doc.pageContent)
        });
    } catch(error){
        console.error('Error processing question:', error.message);
        res.status(500).json({
            error: 'Error processing your question',
            details: process.env.NODE_ENV === 'development' ? error.message: undefined
        });
    }
});

// Start server only after DB is connected and vector store is ready
async function startServer() {
    await initializeVectorStore();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
        console.log("Vector store ready");
    });
}

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        console.log("Running in demo mode with JSON data (no database). Set DB_* in .env to use MySQL.");
        loadJsonFallback();
        registerJsonRoutes(app);
        startServer();
    } else {
        console.log("Connected to MySQL");
        registerDbRoutes();
        startServer();
    }
});

module.exports = app;
