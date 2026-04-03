import API from './api';

// ── Auth ─────────────────────────────────────────────────
export const login    = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe    = ()     => API.get('/auth/me');

// ── Students ─────────────────────────────────────────────
export const getStudents   = (params) => API.get('/students', { params });
export const getStudent    = (id)     => API.get(`/students/${id}`);
export const createStudent = (data)   => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id)     => API.delete(`/students/${id}`);

// ── Courses ──────────────────────────────────────────────
export const getCourses   = (params) => API.get('/courses', { params });
export const getCourse    = (id)     => API.get(`/courses/${id}`);
export const createCourse = (data)   => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id)     => API.delete(`/courses/${id}`);

// Enroll: POST /courses/:courseId/enroll with body { studentId }
export const enrollStudent   = (courseId, data) => API.post(`/courses/${courseId}/enroll`, data);
export const unenrollStudent = (courseId, studentId) => API.delete(`/courses/${courseId}/enroll/${studentId}`);

// ── Marks ────────────────────────────────────────────────
export const getMarks  = (params)     => API.get('/marks', { params });
export const createMark = (data)      => API.post('/marks', data);
export const updateMark = (id, data)  => API.put(`/marks/${id}`, data);
export const deleteMark = (id)        => API.delete(`/marks/${id}`);
export const getMarksByStudent = (studentId, params) => API.get(`/marks/student/${studentId}`, { params });
export const getMarksByCourse  = (courseId, params) => API.get(`/marks/course/${courseId}`, { params });

// ── Fees ─────────────────────────────────────────────────
export const getFees   = (params)    => API.get('/fees', { params });
export const createFee = (data)      => API.post('/fees', data);
export const updateFee = (id, data)  => API.put(`/fees/${id}`, data);
export const deleteFee = (id)        => API.delete(`/fees/${id}`);
export const getFeesByStudent = (studentId, params) => API.get(`/fees/student/${studentId}`, { params });

// ── Attendance ───────────────────────────────────────────
// GET attendance for a specific student: GET /attendance/student/:studentId
export const getAttendance     = (studentId, params) => API.get(`/attendance/student/${studentId}`, { params });
export const markAttendance    = (data)               => API.post('/attendance', data);
export const updateAttendance  = (id, data)           => API.put(`/attendance/${id}`, data);
export const getAttendanceByCourse = (courseId, params) => API.get(`/attendance/course/${courseId}`, { params });

// ── Dashboard ────────────────────────────────────────────
export const getDashboardStats = () => API.get('/dashboard/stats');
