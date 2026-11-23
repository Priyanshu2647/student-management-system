# REST API Documentation - Student Management System

Base URL: `http://localhost:5000/api` (Local) or `https://your-api.onrender.com/api` (Production)

All protected endpoints require an Authorization Header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student or teacher account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve current user profile with role metadata |
| `PUT` | `/api/auth/profile` | Private | Update name, phone, address, and profile settings |
| `PUT` | `/api/auth/change-password` | Private | Update user password with old password check |

### Sample Login Request:
```json
POST /api/auth/login
{
  "email": "admin@sms.com",
  "password": "admin123"
}
```

---

## 2. Student Endpoints (`/api/students`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Admin, Teacher | Get paginated student directory with search & filters |
| `POST` | `/api/students` | Admin | Enroll new student & auto-create login account |
| `GET` | `/api/students/:id` | Admin, Teacher, Student | Get detailed student profile |
| `PUT` | `/api/students/:id` | Admin, Teacher | Update student academic and contact records |
| `DELETE` | `/api/students/:id` | Admin | Permanently delete student & associated user account |
| `GET` | `/api/students/profile/me` | Student | Get logged-in student's personal profile |

---

## 3. Teacher Endpoints (`/api/teachers`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/teachers` | Admin, Teacher, Student | Get faculty directory with filters |
| `POST` | `/api/teachers` | Admin | Add faculty profile & create credentials |
| `GET` | `/api/teachers/:id` | Admin, Teacher, Student | Get teacher record by ID |
| `PUT` | `/api/teachers/:id` | Admin | Update designation, department or info |
| `DELETE` | `/api/teachers/:id` | Admin | Delete teacher and user login |
| `GET` | `/api/teachers/profile/me` | Teacher | Get logged-in teacher profile |

---

## 4. Course Endpoints (`/api/courses`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | All Roles | Get course catalog with department/semester filters |
| `POST` | `/api/courses` | Admin | Add new course syllabus to catalog |
| `GET` | `/api/courses/:id` | All Roles | Get course details & enrolled student count |
| `PUT` | `/api/courses/:id` | Admin | Update course code, credits or assigned faculty |
| `DELETE` | `/api/courses/:id` | Admin | Delete course from curriculum |
| `GET` | `/api/courses/teacher/assigned` | Teacher | Get courses assigned to logged-in teacher |

---

## 5. Attendance Endpoints (`/api/attendance`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Admin, Teacher | Get attendance records filtered by course/date |
| `POST` | `/api/attendance` | Admin, Teacher | Record single student attendance (upsert) |
| `POST` | `/api/attendance/bulk` | Admin, Teacher | Submit class attendance roster in one request |
| `PUT` | `/api/attendance/:id` | Admin, Teacher | Update single attendance entry |
| `GET` | `/api/attendance/stats/:studentId` | Admin, Teacher, Student | Get attendance stats & % breakdown |
| `GET` | `/api/attendance/student/me` | Student | Get logged-in student's attendance stats |

### Sample Bulk Attendance Payload:
```json
POST /api/attendance/bulk
{
  "courseId": "65b...",
  "date": "2026-11-23",
  "records": [
    { "studentId": "65a...", "status": "Present", "remarks": "" },
    { "studentId": "65c...", "status": "Absent", "remarks": "Sick leave" }
  ]
}
```

---

## 6. Examination Result Endpoints (`/api/results`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/results` | Admin, Teacher | Get exam marks with course & semester filters |
| `POST` | `/api/results` | Admin, Teacher | Publish examination marks & calculate grades |
| `GET` | `/api/results/:id` | Admin, Teacher, Student | Get specific exam result record |
| `PUT` | `/api/results/:id` | Admin, Teacher | Edit marks or feedback |
| `DELETE` | `/api/results/:id` | Admin | Delete result record |
| `GET` | `/api/results/student/:studentId` | Admin, Teacher, Student | Get complete academic transcript with CGPA |
| `GET` | `/api/results/student/me` | Student | Get logged-in student's official grade transcript |

---

## 7. Notice Board Endpoints (`/api/notices`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | All Roles | Get circulars sorted by pinned & latest date |
| `POST` | `/api/notices` | Admin, Teacher | Publish circular to campus notice board |
| `GET` | `/api/notices/:id` | All Roles | View notice details |
| `PUT` | `/api/notices/:id` | Author, Admin | Edit announcement content or pin status |
| `DELETE` | `/api/notices/:id` | Author, Admin | Remove notice from bulletin board |

---

## 8. Dashboard Intelligence (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | All Roles | Aggregated dashboard KPI metrics based on user role |
