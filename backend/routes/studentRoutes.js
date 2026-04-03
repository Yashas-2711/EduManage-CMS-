'use strict';

const express = require('express');
const router = express.Router();
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// All student routes require authentication
router.use(protect);

router.route('/')
  .get(getAllStudents)          // GET  /api/v1/students
  .post(addStudent);           // POST /api/v1/students

router.route('/:id')
  .get(getStudentById)                        // GET    /api/v1/students/:id
  .put(updateStudent)                         // PUT    /api/v1/students/:id
  .delete(authorize('admin'), deleteStudent); // DELETE /api/v1/students/:id

module.exports = router;
