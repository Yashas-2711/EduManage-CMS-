'use strict';

const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllCourses)   // GET  /api/v1/courses
  .post(createCourse); // POST /api/v1/courses

router.route('/:id')
  .get(getCourseById)                        // GET    /api/v1/courses/:id
  .put(updateCourse)                         // PUT    /api/v1/courses/:id
  .delete(authorize('admin'), deleteCourse); // DELETE /api/v1/courses/:id

// Enrollment
router.post('/:courseId/enroll', enrollStudent);                           // Enroll student
router.delete('/:courseId/enroll/:studentId', authorize('admin'), unenrollStudent); // Unenroll student

module.exports = router;
