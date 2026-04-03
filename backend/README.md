# 🎓 College Management System — Backend API

A production-ready RESTful backend for managing students, courses, marks, fees, and attendance — built with **Node.js**, **Express**, **Sequelize ORM**, and **MySQL**.

---

## ✨ Features

| Module | Capabilities |
|---|---|
| 🔐 **Auth** | Register, Login, JWT, Protected routes, Role-based access |
| 🎓 **Students** | Add, Read, Update, Delete, Search, Pagination |
| 📚 **Courses** | CRUD + Student Enrollment/Unenrollment |
| 📊 **Marks** | Add marks, Grade auto-calculation, Summary & percentage |
| 💰 **Fees** | Track paid/pending fees, Payment status auto-update |
| 📅 **Attendance** | Single/Bulk mark, Reports with % summary, Date-range filter |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MySQL 8.x running locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_management
JWT_SECRET=change_this_to_a_long_random_string
```

### 3. Create the MySQL database
```sql
CREATE DATABASE college_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Start the server
```bash
npm run dev        # Development (nodemon)
npm start          # Production
```

### 5. Seed demo data (optional)
```bash
npm run seed
```
This creates demo users, students, courses, marks, fees, and attendance.

**Demo Credentials:**
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@cms.edu | Admin@123 |
| Staff | jane@cms.edu  | Staff@123 |

---

## 📚 API Documentation

After starting the server, visit:

> **http://localhost:5000/api/v1/docs**

Full Swagger/OpenAPI 3.0 interactive documentation.

---

## 🗂️ Project Structure

```
├── app.js                  # Express server entry point
├── config/
│   └── database.js         # Sequelize + MySQL config
├── models/
│   ├── index.js            # All associations
│   ├── User.js
│   ├── Student.js
│   ├── Course.js
│   ├── StudentCourse.js    # N:M join table
│   ├── Marks.js
│   ├── Fees.js
│   └── Attendance.js
├── controllers/            # Business logic
│   ├── authController.js
│   ├── studentController.js
│   ├── courseController.js
│   ├── marksController.js
│   ├── feesController.js
│   └── attendanceController.js
├── routes/                 # Express routers
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── courseRoutes.js
│   ├── marksRoutes.js
│   ├── feesRoutes.js
│   └── attendanceRoutes.js
├── middleware/
│   ├── auth.js             # JWT + RBAC
│   └── errorHandler.js     # Centralized errors + asyncHandler
├── utils/
│   ├── logger.js           # Winston logger
│   ├── jwt.js              # Token generator
│   ├── helpers.js          # Pagination, response envelopes
│   └── seed.js             # Database seeder
├── swagger.yaml            # OpenAPI 3.0 spec
├── Dockerfile
├── docker-compose.yml
└── .env
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | Register user |
| POST | `/api/v1/auth/login` | ❌ | Login → JWT |
| GET | `/api/v1/auth/me` | ✅ | Get profile |
| PUT | `/api/v1/auth/change-password` | ✅ | Change password |

### Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/students` | ✅ | List (paginated, searchable) |
| POST | `/api/v1/students` | ✅ | Add student |
| GET | `/api/v1/students/:id` | ✅ | Get by ID |
| PUT | `/api/v1/students/:id` | ✅ | Update |
| DELETE | `/api/v1/students/:id` | 🔒 admin | Delete |

### Courses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/courses` | ✅ | List courses |
| POST | `/api/v1/courses` | ✅ | Create course |
| POST | `/api/v1/courses/:courseId/enroll` | ✅ | Enroll student |
| DELETE | `/api/v1/courses/:courseId/enroll/:studentId` | 🔒 admin | Unenroll |

### Marks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/marks` | ✅ | Add marks |
| GET | `/api/v1/marks/student/:studentId` | ✅ | Marks + summary |
| GET | `/api/v1/marks/course/:courseId` | ✅ | Marks by course |
| PUT | `/api/v1/marks/:id` | ✅ | Update |
| DELETE | `/api/v1/marks/:id` | 🔒 admin | Delete |

### Fees
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/fees` | ✅ | Add fee record |
| GET | `/api/v1/fees/student/:studentId` | ✅ | Fee summary |
| GET | `/api/v1/fees` | 🔒 admin | All records |
| PUT | `/api/v1/fees/:id` | ✅ | Update / pay |
| DELETE | `/api/v1/fees/:id` | 🔒 admin | Delete |

### Attendance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/attendance` | ✅ | Mark (single/bulk) |
| GET | `/api/v1/attendance/student/:studentId` | ✅ | Report + % |
| GET | `/api/v1/attendance/course/:courseId` | ✅ | By course/date |
| PUT | `/api/v1/attendance/:id` | ✅ | Update |
| DELETE | `/api/v1/attendance/:id` | 🔒 admin | Delete |

---

## 🐳 Docker (Optional)

```bash
# Build and run all services
docker-compose up --build

# The API will be at http://localhost:5000
```

---

## 🗃️ Database Relationships

```
User ──────────────── hasMany ──────────────── Student
Student ──────────── belongsToMany ─────────── Course  (via StudentCourse)
Student ──────────── hasMany ───────────────── Marks
Student ──────────── hasMany ───────────────── Fees
Student ──────────── hasMany ───────────────── Attendance
Course  ──────────── hasMany ───────────────── Marks
Course  ──────────── hasMany ───────────────── Attendance
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `college_management` |
| `DB_USER` | DB username | `root` |
| `DB_PASSWORD` | DB password | — |
| `JWT_SECRET` | JWT signing key | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `LOG_LEVEL` | Winston log level | `info` |
| `NODE_ENV` | Environment | `development` |
