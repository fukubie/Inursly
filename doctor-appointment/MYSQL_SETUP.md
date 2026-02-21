# MySQL setup for Inursly backend

Use this when you want to run the backend with a real database instead of demo (JSON) mode.

---

## 1. Install MySQL

### Option A: MySQL Community Server (Windows)

1. Download the MySQL installer: https://dev.mysql.com/downloads/installer/
2. Run the installer, choose **Developer Default** or **Server only**.
3. Set a **root password** and remember it.
4. Complete the setup. MySQL runs as a Windows service.

### Option B: XAMPP (includes MySQL + phpMyAdmin)

1. Download XAMPP: https://www.apachefriends.org/
2. Install and open **XAMPP Control Panel**.
3. Start **MySQL**. Default user: `root`, password: blank (or set in config).

### Option C: Docker

```bash
docker run -d --name inursly-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=doctor_appointment mysql:8
```

---

## 2. Create the database and user (optional but recommended)

1. Open a terminal or **MySQL Command Line Client** / **phpMyAdmin**.
2. Log in as root (e.g. `mysql -u root -p` and enter password).
3. Create database and user:

```sql
CREATE DATABASE doctor_appointment;
CREATE USER 'inursly'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON doctor_appointment.* TO 'inursly'@'localhost';
FLUSH PRIVILEGES;
USE doctor_appointment;
```

Use the same name/password in your `.env` in the next step.

---

## 3. Create tables

Run the following in the `doctor_appointment` database (MySQL CLI or phpMyAdmin SQL tab):

```sql
-- Patients (for signup/login)
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  dob DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors
CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  bio TEXT,
  image_url VARCHAR(500),
  exp INT DEFAULT 0,
  total_patients INT DEFAULT 0,
  online_fee DECIMAL(10,2) DEFAULT 0,
  visit_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specialties (reference list)
CREATE TABLE specialties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Link doctors to specialties (many-to-many)
CREATE TABLE doctor_specialties (
  doctor_id INT NOT NULL,
  specialty_id INT NOT NULL,
  PRIMARY KEY (doctor_id, specialty_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);

-- Clinics
CREATE TABLE doctor_clinic (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  clinic_name VARCHAR(255),
  clinic_fee DECIMAL(10,2),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Appointments
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Reviews (optional; used on doctor detail page)
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Availability (optional; used for doctor slots)
CREATE TABLE availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  available_date DATE,
  start_time TIME,
  end_time TIME,
  is_booked TINYINT(1) DEFAULT 0,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Clinics (for clinic registration)
CREATE TABLE clinics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a few specialties so doctor signup can use them
INSERT INTO specialties (name) VALUES
  ('Cardiology'), ('Pediatrics'), ('Dermatology'), ('Orthopedics'), ('Psychiatry'),
  ('Gastroenterology'), ('Neurology'), ('Oncology'), ('Urology'), ('Endocrinology');
```

---

## 4. Configure the backend

1. In `doctor-appointment/backend`, copy the example env file:

   ```bash
   copy .env.example .env
   ```

2. Edit `backend/.env` and set your MySQL settings:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=inursly
   DB_PASSWORD=your_secure_password
   DB_NAME=doctor_appointment
   GEMINI_API_KEY=your_gemini_key_if_you_use_chatbot
   FRONTEND_URL=http://localhost:4000
   ```

   - If you use **root**: set `DB_USER=root` and `DB_PASSWORD=your_root_password`.
   - If MySQL is on another machine or port, set `DB_HOST` (and port in the connection if needed).

3. Restart the backend:

   ```bash
   cd doctor-appointment/backend
   npm start
   ```

   You should see **Connected to MySQL** and **Server running on port 3000**. If you see **MySQL connection failed** and **Running in demo mode**, check that MySQL is running and that `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env` are correct.

---

## 5. Troubleshooting

| Issue | What to check |
|-------|----------------|
| **MySQL connection failed** | MySQL service is running (Services / XAMPP / Docker). |
| **Access denied** | `DB_USER` and `DB_PASSWORD` in `.env` match the MySQL user. |
| **Unknown database** | Database `doctor_appointment` exists (`CREATE DATABASE doctor_appointment;`). |
| **Table doesn't exist** | Run the CREATE TABLE statements in section 3. |
| **Port 3306 in use** | Another MySQL or app is using 3306; change port or stop the other service. |

On Windows, MySQL is usually on `localhost:3306`. If you use a different port, you may need to change the backend to pass the port (e.g. in `server.js`: `port: process.env.DB_PORT || 3306` in the `mysql.createConnection` config).
