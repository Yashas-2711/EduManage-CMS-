'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Attendance, Student, Course } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getPagination, paginatedResponse, successResponse, createError } = require('../utils/helpers');

/**
 * @desc    Mark attendance (single or bulk)
 * @route   POST /api/v1/attendance
 * @body    Single: { studentId, courseId, date, status, remarks }
 *          Bulk:   { records: [{studentId, courseId, date, status}] }
 * @access  Protected
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body;

  // Bulk insertion
  if (records && Array.isArray(records)) {
    const toInsert = records.map((r) => ({ ...r, markedBy: req.user.id }));
    const created = await Attendance.bulkCreate(toInsert, {
      updateOnDuplicate: ['status', 'remarks', 'markedBy', 'updatedAt'],
    });
    return res.status(201).json(successResponse(created, `${created.length} attendance records saved`));
  }

  // Single record
  const { studentId, courseId, date, status, remarks } = req.body;
  if (!studentId || !courseId || !date) {
    throw createError('studentId, courseId, and date are required.', 400);
  }

  const [attendance, created] = await Attendance.findOrCreate({
    where: { studentId, courseId, date },
    defaults: { status: status || 'present', remarks, markedBy: req.user.id },
  });

  if (!created) {
    // Update existing record
    await attendance.update({ status: status || attendance.status, remarks, markedBy: req.user.id });
  }

  return res.status(created ? 201 : 200).json(
    successResponse(attendance, created ? 'Attendance marked' : 'Attendance updated')
  );
});

/**
 * @desc    Get attendance report for a student
 * @route   GET /api/v1/attendance/student/:studentId?courseId=1&startDate=2024-01-01&endDate=2024-12-31
 * @access  Protected
 */
const getAttendanceByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { courseId, startDate, endDate } = req.query;
  const { limit, offset, page } = getPagination(req.query);

  const student = await Student.findByPk(studentId);
  if (!student) throw createError('Student not found.', 404);

  const where = { studentId };
  if (courseId) where.courseId = courseId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const { count, rows: attendance } = await Attendance.findAndCountAll({
    where,
    include: [{ model: Course, as: 'course', attributes: ['id', 'courseName', 'courseCode'] }],
    limit,
    offset,
    order: [['date', 'DESC']],
  });

  // Attendance summary
  const allRecords = await Attendance.findAll({ where });
  const total = allRecords.length;
  const present = allRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absent = allRecords.filter((a) => a.status === 'absent').length;
  const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

  return res.status(200).json({
    ...paginatedResponse(attendance, count, page, limit),
    summary: {
      totalClasses: total,
      present,
      absent,
      late: allRecords.filter((a) => a.status === 'late').length,
      excused: allRecords.filter((a) => a.status === 'excused').length,
      attendancePercentage: parseFloat(attendancePercentage),
    },
  });
});

/**
 * @desc    Get attendance for a course on a specific date
 * @route   GET /api/v1/attendance/course/:courseId?date=2024-04-01
 * @access  Protected
 */
const getAttendanceByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { date } = req.query;

  const where = { courseId };
  if (date) where.date = date;

  const records = await Attendance.findAll({
    where,
    include: [{ model: Student, as: 'student', attributes: ['id', 'rollNumber', 'firstName', 'lastName'] }],
    order: [['date', 'DESC']],
  });

  return res.status(200).json(successResponse(records));
});

/**
 * @desc    Update attendance record
 * @route   PUT /api/v1/attendance/:id
 * @access  Protected
 */
const updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByPk(req.params.id);
  if (!record) throw createError('Attendance record not found.', 404);

  await record.update(req.body);
  return res.status(200).json(successResponse(record, 'Attendance updated'));
});

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/v1/attendance/:id
 * @access  Protected (admin)
 */
const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByPk(req.params.id);
  if (!record) throw createError('Attendance record not found.', 404);

  await record.destroy();
  return res.status(200).json(successResponse(null, 'Attendance record deleted'));
});

module.exports = {
  markAttendance,
  getAttendanceByStudent,
  getAttendanceByCourse,
  updateAttendance,
  deleteAttendance,
};
