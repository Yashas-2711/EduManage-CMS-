'use strict';

const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByStudent,
  getAttendanceByCourse,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', markAttendance);                            // POST  /api/v1/attendance
router.get('/student/:studentId', getAttendanceByStudent);   // GET   /api/v1/attendance/student/:id
router.get('/course/:courseId', getAttendanceByCourse);      // GET   /api/v1/attendance/course/:id

router.route('/:id')
  .put(updateAttendance)                                     // PUT   /api/v1/attendance/:id
  .delete(authorize('admin'), deleteAttendance);             // DELETE /api/v1/attendance/:id

module.exports = router;
