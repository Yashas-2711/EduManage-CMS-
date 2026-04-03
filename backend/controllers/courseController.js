'use strict';

const { Op } = require('sequelize');
const { Course, Student, StudentCourse } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination, paginatedResponse, successResponse, createError } = require('../utils/helpers');

/**
 * @desc    Create a new course
 * @route   POST /api/v1/courses
 * @access  Protected
 */
const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  return res.status(201).json(successResponse(course, 'Course created successfully'));
});

/**
 * @desc    Get all courses (paginated + searchable)
 * @route   GET /api/v1/courses?page=1&limit=10&search=math&department=CS&semester=2
 * @access  Protected
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const { search, department, semester, isActive } = req.query;

  const where = {};
  if (search) {
    where[Op.or] = [
      { courseName: { [Op.like]: `%${search}%` } },
      { courseCode: { [Op.like]: `%${search}%` } },
    ];
  }
  if (department) where.department = department;
  if (semester) where.semester = parseInt(semester, 10);
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const { count, rows } = await Course.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json(paginatedResponse(rows, count, page, limit));
});

/**
 * @desc    Get course by ID (with enrolled students)
 * @route   GET /api/v1/courses/:id
 * @access  Protected
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [{ model: Student, as: 'students', through: { attributes: ['enrollmentDate', 'status'] } }],
  });
  if (!course) throw createError('Course not found.', 404);
  return res.status(200).json(successResponse(course));
});

/**
 * @desc    Update course
 * @route   PUT /api/v1/courses/:id
 * @access  Protected
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) throw createError('Course not found.', 404);

  await course.update(req.body);
  return res.status(200).json(successResponse(course, 'Course updated successfully'));
});

/**
 * @desc    Delete course
 * @route   DELETE /api/v1/courses/:id
 * @access  Protected (admin)
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) throw createError('Course not found.', 404);

  await course.destroy();
  return res.status(200).json(successResponse(null, 'Course deleted successfully'));
});

/**
 * @desc    Assign a course to a student (enroll)
 * @route   POST /api/v1/courses/:courseId/enroll
 * @access  Protected
 * @body    { studentId }
 */
const enrollStudent = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) throw createError('studentId is required.', 400);

  const course = await Course.findByPk(courseId);
  if (!course) throw createError('Course not found.', 404);

  const student = await Student.findByPk(studentId);
  if (!student) throw createError('Student not found.', 404);

  // Check for existing enrollment
  const existing = await StudentCourse.findOne({ where: { studentId, courseId } });
  if (existing) throw createError('Student is already enrolled in this course.', 409);

  const enrollment = await StudentCourse.create({ studentId, courseId });
  return res.status(201).json(successResponse(enrollment, 'Student enrolled in course successfully'));
});

/**
 * @desc    Remove a student from a course (unenroll)
 * @route   DELETE /api/v1/courses/:courseId/enroll/:studentId
 * @access  Protected (admin)
 */
const unenrollStudent = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.params;

  const enrollment = await StudentCourse.findOne({ where: { studentId, courseId } });
  if (!enrollment) throw createError('Enrollment not found.', 404);

  await enrollment.destroy();
  return res.status(200).json(successResponse(null, 'Student unenrolled from course successfully'));
});

module.exports = { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, enrollStudent, unenrollStudent };
