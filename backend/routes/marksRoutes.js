'use strict';

const express = require('express');
const router = express.Router();
const {
  addMarks,
  getAllMarks,
  getMarksByStudent,
  updateMarks,
  deleteMarks,
  getMarksByCourse,
} = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllMarks)  // GET  /api/v1/marks       ← NEW: admin overview
  .post(addMarks);  // POST /api/v1/marks

router.get('/student/:studentId', getMarksByStudent);  // GET /api/v1/marks/student/:id
router.get('/course/:courseId', getMarksByCourse);     // GET /api/v1/marks/course/:id

router.route('/:id')
  .put(updateMarks)                         // PUT    /api/v1/marks/:id
  .delete(authorize('admin'), deleteMarks); // DELETE /api/v1/marks/:id

module.exports = router;
