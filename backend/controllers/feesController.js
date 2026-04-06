'use strict';

const { Fees, Student } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination, paginatedResponse, successResponse, createError } = require('../utils/helpers');

/**
 * @desc    Add a fee record for a student
 * @route   POST /api/v1/fees
 * @access  Protected
 */
const addFees = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) throw createError('studentId is required.', 400);

  const student = await Student.findByPk(studentId);
  if (!student) throw createError('Student not found.', 404);

  const fee = await Fees.create(req.body);
  return res.status(201).json(successResponse(fee, 'Fee record created successfully'));
});

/**
 * @desc    Get all fees for a student
 * @route   GET /api/v1/fees/student/:studentId
 * @access  Protected
 */
const getFeesByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { limit, offset, page } = getPagination(req.query);
  const { status } = req.query;

  const student = await Student.findByPk(studentId);
  if (!student) throw createError('Student not found.', 404);

  const where = { studentId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.feeType) where.feeType = req.query.feeType;
  if (req.query.semester) where.semester = req.query.semester;
  if (req.query.academicYear) where.academicYear = req.query.academicYear;
  if (req.query.paymentMode) where.paymentMode = req.query.paymentMode;

  const { count, rows: fees } = await Fees.findAndCountAll({
    where,
    limit,
    offset,
    order: [['dueDate', 'ASC']],
  });

  // Fee summary
  const allFees = await Fees.findAll({ where: { studentId } });
  const totalAmount = allFees.reduce((s, f) => s + parseFloat(f.totalAmount), 0);
  const totalPaid = allFees.reduce((s, f) => s + parseFloat(f.paidAmount), 0);
  const totalPending = (totalAmount - totalPaid).toFixed(2);

  return res.status(200).json({
    ...paginatedResponse(fees, count, page, limit),
    summary: {
      totalAmount,
      totalPaid,
      totalPending: parseFloat(totalPending),
    },
  });
});

/**
 * @desc    Update fee record (e.g., mark payment)
 * @route   PUT /api/v1/fees/:id
 * @access  Protected
 */
const updateFees = asyncHandler(async (req, res) => {
  const fee = await Fees.findByPk(req.params.id);
  if (!fee) throw createError('Fee record not found.', 404);

  await fee.update(req.body);
  return res.status(200).json(successResponse(fee, 'Fee record updated successfully'));
});

/**
 * @desc    Delete fee record
 * @route   DELETE /api/v1/fees/:id
 * @access  Protected (admin)
 */
const deleteFees = asyncHandler(async (req, res) => {
  const fee = await Fees.findByPk(req.params.id);
  if (!fee) throw createError('Fee record not found.', 404);

  await fee.destroy();
  return res.status(200).json(successResponse(null, 'Fee record deleted successfully'));
});

/**
 * @desc    Get all fee records (admin overview)
 * @route   GET /api/v1/fees?status=pending&page=1&limit=10
 * @access  Protected (admin)
 */
const getAllFees = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.feeType) where.feeType = req.query.feeType;
  if (req.query.semester) where.semester = req.query.semester;
  if (req.query.academicYear) where.academicYear = req.query.academicYear;
  if (req.query.paymentMode) where.paymentMode = req.query.paymentMode;

  const { count, rows } = await Fees.findAndCountAll({
    where,
    include: [{ model: Student, as: 'student', attributes: ['id', 'rollNumber', 'firstName', 'lastName'] }],
    limit,
    offset,
    order: [['dueDate', 'ASC']],
  });

  return res.status(200).json(paginatedResponse(rows, count, page, limit));
});

module.exports = { addFees, getFeesByStudent, updateFees, deleteFees, getAllFees };
