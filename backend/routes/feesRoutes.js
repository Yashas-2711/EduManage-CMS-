'use strict';

const express = require('express');
const router = express.Router();
const {
  addFees,
  getFeesByStudent,
  updateFees,
  deleteFees,
  getAllFees,
} = require('../controllers/feesController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorize('admin'), getAllFees) // GET  /api/v1/fees  (admin overview)
  .post(addFees);                      // POST /api/v1/fees

router.get('/student/:studentId', getFeesByStudent); // GET /api/v1/fees/student/:id

router.route('/:id')
  .put(updateFees)                         // PUT    /api/v1/fees/:id
  .delete(authorize('admin'), deleteFees); // DELETE /api/v1/fees/:id

module.exports = router;
