import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Students   from './pages/Students';
import Courses    from './pages/Courses';
import Marks      from './pages/Marks';
import Fees       from './pages/Fees';
import Attendance from './pages/Attendance';

const App = () => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('cms_dark') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cms_dark', darkMode);
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout darkMode={darkMode} toggleDark={() => setDarkMode((d) => !d)} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="students"   element={<Students />} />
            <Route path="courses"    element={<Courses />} />
            <Route path="marks"      element={<Marks />} />
            <Route path="fees"       element={<Fees />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
};

export default App;
