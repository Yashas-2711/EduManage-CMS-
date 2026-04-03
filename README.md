# 🎓 EduManage CMS (Full-Stack College Management System)

A premium, modern, and highly scalable **College Management System** built to seamlessly handle student lifecycle data, academic courses, grading, fee tracking, and attendance.

EduManage utilizes a completely decoupled architecture, separating a robust Node.js/Sequelize backend API from a rich, dynamic React 19 / Tailwind v4 frontend interface.

---

## 🌟 Key Features

- **JWT-Protected Ecosystem**: Full-stack route and data protection. Role-based access logic ensures safe operations.
- **Dynamic Dashboards**: Auto-calculating analytics for total registered students, course distributions, payment dues, and overall attendance rates.
- **Student & Course Management**: Enroll students, assign them to rigorous courses, compute automated Grade Point averages (GPA), and edit records intuitively.
- **Financial Tracking System**: Robust fee ledger computing total amounts billed vs. amounts paid natively generating "Remaining Balances" on the fly automatically categorizing overdue/pending statuses.
- **Attendance Ledgers**: Real-time interactive student attendance marking. 
- **Premium User Experience**: Designed utilizing glass-morphism, responsive grids, and micro-animations exclusively via Tailwind CSS v4 and Lucide React.
- **Docker Ready**: Pre-configured multi-stage `Dockerfile` and `nginx.conf` setups available for isolated production deployment.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React 19 & Vite 
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 & Tailwind Vite plugin
- **State & HTTP:** Axios (with smart interceptors)
- **UI Libraries:** Lucide React (Icons), React Hot Toast (Notifications)

### **Backend**
- **Environment:** Node.js & Express.js
- **Database:** MySQL relational database 
- **ORM:** Sequelize (utilizing abstracted Models & lifecycle hooks)
- **Security:** `bcryptjs` (Password hashing) & `jsonwebtoken` (Auth Tokens)
- **Logging:** Custom Winston loggers & Morgan HTTP tracking.

---

## 🚀 Installation & Setup

### Prerequisites
Make sure you have [Node.js (v18+)](https://nodejs.org/) installed and a locally running instance of [MySQL](https://www.mysql.com/).

### 1. Database Setup
1. Open your MySQL client and create the database schema:
   ```sql
   CREATE DATABASE college_management;
   ```
2. Navigate to your backend directory and set up your `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=college_management
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=30d
   ```

### 2. Booting the Backend
```bash
cd backend
npm install
npm run dev
```
*(The backend will run on `http://localhost:5000` and automatically sync/create Sequelized tables in your MySQL database).*

### 3. Booting the Frontend
Open a new separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will be available at `http://localhost:5173`).*

---

## 📡 Core API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Securely login user and retrieve JWT string | Public |
| `POST` | `/api/v1/auth/register` | Register new administrative `staff`, `admin`, or `teacher` accounts | Public |
| `GET` | `/api/v1/dashboard/stats` | Retrieve aggregated analytical counts | Protected |
| `POST` | `/api/v1/courses/:courseId/enroll` | Enroll a student contextually into an explicit course | Protected |
| `GET` | `/api/v1/fees` | Retrieve ledger spanning all registered fees across all students | Protected |
| `GET` | `/api/v1/attendance/student/:id` | Fetch all historical temporal attendance logs mapped to a specific student ID | Protected |

---

## 👨‍💻 Architecture & Philosophy

The system was crafted keeping **Separation of Concerns (SoC)** and **Scale** in mind:
- **Backend Error Handling:** Completely centralized Express `asyncHandler` middleware catches any Sequelize validation constraints or bad parameters, safely piping it globally rather than crashing the thread.
- **Database Hooks:** The Sequelize ORM actively runs pre-computation tasks (like automatically classifying a `C` or `A+` grade based strictly on numeric percentages before MySQL writes saving processor loads during `GET` queries). 
- **Frontend Interceptors:** The React application observes global network statuses natively trapping expired tokens/401 bounces and systematically deleting garbage states executing safe redirect bounces to login flows natively. 
