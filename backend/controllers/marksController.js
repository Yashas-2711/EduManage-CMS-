'use strict';

const { Op } = require('sequelize');
const { Marks, Student, Course } = require('../models');
const { sequelize } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination, paginatedResponse, successResponse, createError } = require('../utils/helpers');

/**
 * @desc    Add marks for a student in a course
 * @route   POST /api/v1/marks
 */
const addMarks = asyncHandler(async (req, res) => {
  const { studentId, courseId, examType, marksObtained, maxMarks, examDate, remarks } = req.body;

  if (!studentId || !courseId || marksObtained === undefined) {
    throw createError('studentId, courseId, and marksObtained are required.', 400);
  }

  const [student, course] = await Promise.all([
    Student.findByPk(studentId),
    Course.findByPk(courseId),
  ]);
  if (!student) throw createError('Student not found.', 404);
  if (!course) throw createError('Course not found.', 404);

  const mark = await Marks.create({ studentId, courseId, examType, marksObtained, maxMarks, examDate, remarks });

  return res.status(201).json(successResponse(mark, 'Marks added successfully'));
});

/**
 * @desc    Get ALL marks (admin overview)
 * @route   GET /api/v1/marks
 */
const getAllMarks = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const where = {};
  if (req.query.studentId) where.studentId = req.query.studentId;
  if (req.query.courseId)  where.courseId  = req.query.courseId;

  const { count, rows } = await Marks.findAndCountAll({
    where,
    include: [
      { model: Student, as: 'student', attributes: ['id', 'rollNumber', 'firstName', 'lastName'] },
      { model: Course,  as: 'course',  attributes: ['id', 'courseName', 'courseCode'] },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json(paginatedResponse(rows, count, page, limit));
});

/**
 * @desc    Get all marks for a student (with course details + summary)
 * @route   GET /api/v1/marks/student/:studentId
 */
const getMarksByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { limit, offset, page } = getPagination(req.query);

  const student = await Student.findByPk(studentId);
  if (!student) throw createError('Student not found.', 404);

  const { count, rows: marks } = await Marks.findAndCountAll({
    where: { studentId },
    include: [{ model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode', 'credits'] }],
    limit,
    offset,
    order: [['examDate', 'DESC']],
  });

  const allMarks = await Marks.findAll({ where: { studentId } });
  const totalObtained = allMarks.reduce((sum, m) => sum + parseFloat(m.marksObtained), 0);
  const totalMax = allMarks.reduce((sum, m) => sum + parseFloat(m.maxMarks), 0);
  const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';

  return res.status(200).json({
    ...paginatedResponse(marks, count, page, limit),
    summary: {
      totalSubjects: allMarks.length,
      totalObtained,
      totalMax,
      overallPercentage: parseFloat(overallPercentage),
    },
  });
});

/**
 * @desc    Update marks
 * @route   PUT /api/v1/marks/:id
 */
const updateMarks = asyncHandler(async (req, res) => {
  const mark = await Marks.findByPk(req.params.id);
  if (!mark) throw createError('Marks record not found.', 404);

  await mark.update(req.body);
  return res.status(200).json(successResponse(mark, 'Marks updated successfully'));
});

/**
 * @desc    Delete marks record
 * @route   DELETE /api/v1/marks/:id
 */
const deleteMarks = asyncHandler(async (req, res) => {
  const mark = await Marks.findByPk(req.params.id);
  if (!mark) throw createError('Marks record not found.', 404);

  await mark.destroy();
  return res.status(200).json(successResponse(null, 'Marks deleted successfully'));
});

/**
 * @desc    Get marks for a specific course
 * @route   GET /api/v1/marks/course/:courseId
 */
const getMarksByCourse = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const { count, rows } = await Marks.findAndCountAll({
    where: { courseId: req.params.courseId },
    include: [{ model: Student, as: 'student', attributes: ['id', 'rollNumber', 'firstName', 'lastName'] }],
    limit,
    offset,
  });
  return res.status(200).json(paginatedResponse(rows, count, page, limit));
});

module.exports = { addMarks, getAllMarks, getMarksByStudent, updateMarks, deleteMarks, getMarksByCourse };
