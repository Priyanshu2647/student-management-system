# EduTrack: Modern Student Management System (MERN Stack)

[![MERN Stack](https://img.shields.io/badge/Stack-MongoDB%20|%20Express%20|%20React%20|%20Node.js-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A complete, production-grade, responsive, and secure **Student Management System** developed using the **MERN Stack** (MongoDB, Express.js, React.js with Vite, and Node.js). Designed for colleges, universities, and educational institutions to streamline admissions, student records, faculty workloads, daily lecture attendance, examinations, and campus announcements.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin:** Master command center with full institutional control, student admissions, teacher directory, course syllabus creation, college-wide notices, and analytical reports.
- **Faculty / Teacher:** Class roster attendance marking with single-click bulk updates, publishing examination marks, viewing assigned courses, and posting academic circulars.
- **Student:** Personalized student portal with live attendance tracker, official printable grade transcript with CGPA calculation, course syllabus viewer, and notice bulletin board.

### 2. Comprehensive Main Modules
- 🔐 **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs password hashing, protected frontend routes, and role-based API authorization middleware.
- 👥 **Student Management:** Full CRUD operations, roll number generation, department filtering, semester tracking, address, guardian contact details, and modal profile views.
- 🎓 **Faculty Management:** Complete faculty directory, department allocation, designation, qualifications, and course assignments.
- 📚 **Course Catalog:** Subject codes, credit ratings (1–6), syllabus outlines, department mapping, and teacher associations.
- 📅 **Attendance Management:** Interactive class roster with "Mark All Present", "Mark All Absent", custom remarks, and student attendance percentage calculation (with a 75% benchmark indicator).
- 🏆 **Examination & Grade Cards:** Score entries for Midterm, Final, Quiz, and Practical exams. Automatic percentage and letter grade calculation (`A+`, `A`, `B+`, `B`, `C`, `D`, `F`), cumulative GPA (10.0 scale), and printable transcript views.
- 📢 **Campus Notice Board:** Categorized circulars (*Academic, Examination, Event, Holiday, General, Urgent*), audience targeting, and sticky pinned notices.
- 📊 **Reports & Analytics:** Real-time metrics, interactive Recharts department distribution bars, attendance ratios, and exportable student rosters in CSV format.
- 👤 **Profile & Security Settings:** Update contact details and change passwords securely.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, RESTful Architecture, CORS, Morgan |
| **Database** | MongoDB & Mongoose ODM (MongoDB Atlas ready) |
| **Security** | JWT Authentication, bcryptjs password hashing, Input validation, HTTP status codes |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database) |

---

## 📂 Project Architecture

```
student-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profiles & passwords
│   │   ├── studentController.js  # Student CRUD, search, filter & directory
│   │   ├── teacherController.js  # Faculty CRUD & course assignment
│   │   ├── courseController.js   # Syllabus & curriculum management
│   │   ├── attendanceController.js # Single & bulk attendance tracking
│   │   ├── resultController.js   # Examination marks & CGPA calculation
│   │   ├── noticeController.js   # Campus notices & announcements
│   │   └── dashboardController.js# Aggregated role-based dashboard metrics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization (RBAC)
│   │   └── errorMiddleware.js    # Centralized error & 404 handlers
│   ├── models/
│   │   ├── User.js               # User credentials & authentication model
│   │   ├── Student.js            # Comprehensive student profile model
│   │   ├── Teacher.js            # Faculty member model
│   │   ├── Course.js             # Academic course model
│   │   ├── Attendance.js         # Daily attendance records model
│   │   ├── Result.js             # Examination scores & grades model
│   │   └── Notice.js             # Campus announcements model
│   ├── routes/                   # Express REST API routes
│   ├── seeder.js                 # Realistic seed data script with test users
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar, DataTable, StatCard, Modals, Toast
│   │   │   ├── dashboard/        # AdminDashboard, TeacherDashboard, StudentDashboard
│   │   │   ├── students/         # StudentFormModal, StudentDetailModal
│   │   │   ├── teachers/         # TeacherFormModal
│   │   │   ├── courses/          # CourseFormModal
│   │   │   ├── attendance/       # AttendanceManager, StudentAttendanceView
│   │   │   ├── results/          # ResultManager, StudentResultView
│   │   │   └── notices/          # NoticeFormModal, RecentNoticesWidget
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global authentication state & session persistence
│   │   ├── services/             # Axios API service clients
│   │   ├── pages/                # High-level route pages
│   │   ├── App.jsx               # Application routing & layout shell
│   │   ├── main.jsx              # Vite React entry point
│   │   └── index.css             # Tailwind base & custom print rules
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── DEPLOYMENT.md                 # Production deployment step-by-step guide
├── API_DOCUMENTATION.md          # REST API endpoints & payload specifications
├── .gitignore
└── README.md
```

---

## ⚡ Installation & Quick Start

### 1. Prerequisites
- **Node.js** v18+ installed on your machine
- **MongoDB** (Local instance or free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Update `MONGO_URI` with your MongoDB connection string if using MongoDB Atlas).*

4. **Seed Demo Data** (Creates test users, courses, attendance, and exam marks):
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   # Development mode with auto-reload:
   npm run dev

   # Or standard production mode:
   npm start
   ```
   *The API will run at `http://localhost:5000`.*

---

### 3. Frontend Setup
1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 🔑 Demo Login Credentials

The application includes one-click demo login buttons directly on the sign-in page:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sms.com` | `admin123` | Full access to students, teachers, courses, notices & analytics |
| **Faculty / Teacher** | `teacher@sms.com` | `teacher123` | Mark attendance, publish exam grades, view assigned courses |
| **Student** | `student@sms.com` | `student123` | View personal attendance %, download/print grade sheets, read notices |

---

## 🧪 Testing with Postman

1. Import the endpoints detailed in [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).
2. Authenticate by making a `POST` request to `/api/auth/login` with `{"email": "admin@sms.com", "password": "admin123"}`.
3. Copy the returned `token`.
4. In subsequent requests, add the header:
   ```http
   Authorization: Bearer <your_jwt_token>
   ```
5. Test CRUD operations on `/api/students`, `/api/teachers`, `/api/courses`, `/api/attendance/bulk`, and `/api/results`.

---

## 🌐 Production Deployment

Refer to [`DEPLOYMENT.md`](DEPLOYMENT.md) for full instructions:
- **Database:** MongoDB Atlas (M0 Free Shared Cluster)
- **Backend:** Render (`npm start`, Web Service)
- **Frontend:** Vercel (Vite SPA framework preset)

---

## 📦 Version Control & GitHub Commands

```bash
# Initialize git repository
git init

# Add all project files
git add .

# Create initial commit
git commit -m "feat: complete student management system with MERN stack"

# Rename default branch
git branch -M main

# Link your remote GitHub repository
git remote add origin https://github.com/your-username/student-management-system.git

# Push to GitHub
git push -u origin main
```

---

## 📄 License
This project is open-source and released under the [MIT License](LICENSE).
#   S t u d e n t - M a n a g e m e n t - S y s t e m  
 