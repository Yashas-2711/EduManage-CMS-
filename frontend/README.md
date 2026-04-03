# EduManage CMS - Frontend 🎓

Welcome to the **EduManage College Management System (CMS)** frontend codebase! This web application provides a premium, responsive, and seamless user interface for administrators to manage student records, attendances, course enrollments, marks, and fees.

## ✨ Key Features

- **Modern & Premium UI:** Beautifully crafted layout using modern design aesthetics, gradients, and micro-animations via [Tailwind CSS v4](https://tailwindcss.com/).
- **Secure Authentication:** Secure JWT-based protected routing. Users cannot access dashboard operations without a valid authentication token.
- **Dynamic Dashboards:** Intuitive dashboards with at-a-glance analytics for total students, total billed/paid fees, active courses, and attendance rates.
- **RESTful API Integrated:** Deeply integrated with the Express/Sequelize backend for full CRUD operations.
- **Dark Mode Support:** Fluid Light and Dark mode variations using Tailwind's core strategies.
- **Client-Side Notifications:** Real-time user feedback mapping success/error responses using [react-hot-toast](https://react-hot-toast.com/).

## 💻 Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (with `@import "tailwindcss";` strategy)
- **Routing:** React Router v7
- **HTTP Client:** Axios (featuring request/response interceptors to handle 401 bounce logic securely)
- **Icons:** Lucide React

## 📂 Folder Structure

```text
src/
├── components/       # Reusable UI components (Table, Modal, Sidebar, Navbar)
├── layouts/          # Page wrappers (Layout.jsx wrapping Sidebar + Main Content)
├── pages/            # Core views (Dashboard, Login, Students, Courses, Marks, etc.)
├── services/         # API integration layer (api.js, cmsService.js)
├── utils/            # Authentication & token extraction helpers
├── App.jsx           # Main Application Routing
└── index.css         # Global styles & Tailwind v4 Theme Tokens
```

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or newer recommended) installed. You must also have the `backend` project running at `http://localhost:5000` to properly authenticate and consume API data.

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install standard dependencies:
   ```bash
   npm install
   ```

### Running for Development

Start the Vite development server:
```bash
npm run dev
```
The app will be available at [http://localhost:5173/](http://localhost:5173/).

## 🔌 API Implementation Notes

This frontend utilizes Axios interceptors inside `src/services/api.js`.
- It automatically plucks the JWT token from `localStorage` using `src/utils/auth.js` and injects the `Bearer` header into all future outbound API requests.
- If the server ever responds with a `401 Unauthorized` status (e.g. invalid credentials or expired token), it automatically executes a forced `logout()` routine which clears locally stored user metrics and safely bounces the user back to `/login`.

## 🎨 Styling Architecture
We use the newly released **Tailwind CSS v4**, which removes the need for `tailwind.config.js` and utilizes simple standard CSS imports. Theme design tokens (colors, font-families) are natively integrated inside `src/index.css`. 
