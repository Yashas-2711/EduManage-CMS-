'use strict';

const { Op } = require('sequelize');
const { Student, User, Course } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination, paginatedResponse, successResponse, createError } = require('../utils/helpers');

/**
 * @desc    Add a new student
 * @route   POST /api/v1/students
 * @access  Protected
 */
const addStudent = asyncHandler(async (req, res) => {
  const student = await Student.create({ ...req.body, userId: req.user.id });
  return res.status(201).json(successResponse(student, 'Student added successfully'));
});

/**
 * @desc    Get all students (paginated + searchable)
 * @route   GET /api/v1/students?page=1&limit=10&search=john&department=CS
 * @access  Protected
 */
const getAllStudents = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const { search, department, semester, isActive } = req.query;

  // Build dynamic where clause
  const where = {};
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { rollNumber: { [Op.like]: `%${search}%` } },
    ];
  }
  if (department) where.department = department;
  if (semester) where.semester = parseInt(semester, 10);
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const { count, rows } = await Student.findAndCountAll({
    where,
    limit,
    offset,
    include: [{ model: User, as: 'registeredBy', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json(paginatedResponse(rows, count, page, limit));
});

/**
 * @desc    Get student by ID
 * @route   GET /api/v1/students/:id
 * @access  Protected
 */
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id, {
    include: [
      { model: User, as: 'registeredBy', attributes: ['id', 'name', 'email'] },
      { model: Course, as: 'courses', through: { attributes: ['enrollmentDate', 'status'] } },
    ],
  });

  if (!student) throw createError('Student not found.', 404);
  return res.status(200).json(successResponse(student));
});

/**
 * @desc    Update student
 * @route   PUT /api/v1/students/:id
 * @access  Protected
 */
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) throw createError('Student not found.', 404);

  await student.update(req.body);
  return res.status(200).json(successResponse(student, 'Student updated successfully'));
});

/**
 * @desc    Delete student
 * @route   DELETE /api/v1/students/:id
 * @access  Protected (admin only)
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) throw createError('Student not found.', 404);

  await student.destroy();
  return res.status(200).json(successResponse(null, 'Student deleted successfully'));
});

module.exports = { addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };
