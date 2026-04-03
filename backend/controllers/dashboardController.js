'use strict';

const { Student, Course, Fees, Attendance } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');
const { sequelize } = require('../config/database');

/**
 * @desc    Get dashboard overview stats
 * @route   GET /api/v1/dashboard/stats
 * @access  Protected
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalCourses,
    feesData,
    attendanceData,
  ] = await Promise.all([
    Student.count({ where: { isActive: true } }),
    Course.count({ where: { isActive: true } }),
    Fees.findAll({ attributes: ['totalAmount', 'paidAmount', 'status'] }),
    Attendance.findAll({ attributes: ['status'] }),
  ]);

  // Fee summary
  const totalFeeAmount = feesData.reduce((s, f) => s + parseFloat(f.totalAmount || 0), 0);
  const totalPaid      = feesData.reduce((s, f) => s + parseFloat(f.paidAmount  || 0), 0);
  const totalPending   = totalFeeAmount - totalPaid;

  // Attendance rate
  const totalAttendance = attendanceData.length;
  const presentCount    = attendanceData.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate  = totalAttendance > 0
    ? parseFloat(((presentCount / totalAttendance) * 100).toFixed(1))
    : 0;

  return res.status(200).json(
    successResponse({
      students: totalStudents,
      courses: totalCourses,
      fees: {
        paid: parseFloat(totalPaid.toFixed(2)),
        pending: parseFloat(totalPending.toFixed(2)),
        total: parseFloat(totalFeeAmount.toFixed(2)),
      },
      attendanceRate,
    }, 'Dashboard stats fetched')
  );
});

module.exports = { getDashboardStats };
