'use strict';

/**
 * Seed Script — populates the database with demo data.
 * Usage: node utils/seed.js
 */

require('dotenv').config();
const { connectDB } = require('../config/database');
const { User, Student, Course, Marks, Fees, Attendance, StudentCourse } = require('../models');
const logger = require('./logger');

const seed = async () => {
  try {
    await connectDB(true); // force: true drops & recreates tables

    logger.info('🌱 Seeding database...');

    // ── 1. Users ─────────────────────────────────
    const [admin, staff] = await User.bulkCreate([
      { name: 'Super Admin', email: 'admin@cms.edu', password: 'Admin@123', role: 'admin' },
      { name: 'Jane Staff', email: 'jane@cms.edu', password: 'Staff@123', role: 'staff' },
    ]);
    logger.info('✅ Users seeded');

    // ── 2. Courses ────────────────────────────────
    const courses = await Course.bulkCreate([
      { courseCode: 'CS301', courseName: 'Data Structures', credits: 4, department: 'Computer Science', semester: 3 },
      { courseCode: 'CS302', courseName: 'Algorithms', credits: 4, department: 'Computer Science', semester: 3 },
      { courseCode: 'CS401', courseName: 'Operating Systems', credits: 3, department: 'Computer Science', semester: 4 },
      { courseCode: 'MA101', courseName: 'Engineering Mathematics', credits: 4, department: 'Mathematics', semester: 1 },
      { courseCode: 'PH101', courseName: 'Engineering Physics', credits: 3, department: 'Physics', semester: 1 },
    ]);
    logger.info('✅ Courses seeded');

    // ── 3. Students ───────────────────────────────
    const students = await Student.bulkCreate([
      { rollNumber: 'CS2024001', firstName: 'Alice', lastName: 'Johnson', email: 'alice@college.edu', phone: '9876543210', department: 'Computer Science', semester: 3, admissionYear: 2024, userId: admin.id },
      { rollNumber: 'CS2024002', firstName: 'Bob', lastName: 'Williams', email: 'bob@college.edu', phone: '9876543211', department: 'Computer Science', semester: 3, admissionYear: 2024, userId: admin.id },
      { rollNumber: 'CS2024003', firstName: 'Carol', lastName: 'Davis', email: 'carol@college.edu', phone: '9876543212', department: 'Computer Science', semester: 4, admissionYear: 2023, userId: staff.id },
      { rollNumber: 'MA2024001', firstName: 'Dave', lastName: 'Brown', email: 'dave@college.edu', phone: '9876543213', department: 'Mathematics', semester: 1, admissionYear: 2024, userId: staff.id },
    ]);
    logger.info('✅ Students seeded');

    // ── 4. Enrollments (N:M) ──────────────────────
    await StudentCourse.bulkCreate([
      { studentId: students[0].id, courseId: courses[0].id },
      { studentId: students[0].id, courseId: courses[1].id },
      { studentId: students[1].id, courseId: courses[0].id },
      { studentId: students[2].id, courseId: courses[2].id },
      { studentId: students[3].id, courseId: courses[3].id },
    ]);
    logger.info('✅ Enrollments seeded');

    // ── 5. Marks ──────────────────────────────────
    await Marks.bulkCreate([
      { studentId: students[0].id, courseId: courses[0].id, examType: 'internal', marksObtained: 38, maxMarks: 50, examDate: '2024-02-15' },
      { studentId: students[0].id, courseId: courses[0].id, examType: 'external', marksObtained: 72, maxMarks: 100, examDate: '2024-05-10' },
      { studentId: students[0].id, courseId: courses[1].id, examType: 'internal', marksObtained: 44, maxMarks: 50, examDate: '2024-02-16' },
      { studentId: students[1].id, courseId: courses[0].id, examType: 'internal', marksObtained: 35, maxMarks: 50, examDate: '2024-02-15' },
      { studentId: students[2].id, courseId: courses[2].id, examType: 'external', marksObtained: 65, maxMarks: 100, examDate: '2024-05-12' },
    ]);
    logger.info('✅ Marks seeded');

    // ── 6. Fees ───────────────────────────────────
    const dueDate = '2024-07-31';
    await Fees.bulkCreate([
      { studentId: students[0].id, feeType: 'tuition', totalAmount: 50000, paidAmount: 50000, dueDate, paymentMode: 'online', semester: 3, academicYear: '2024-25' },
      { studentId: students[1].id, feeType: 'tuition', totalAmount: 50000, paidAmount: 25000, dueDate, paymentMode: 'cash', semester: 3, academicYear: '2024-25' },
      { studentId: students[2].id, feeType: 'tuition', totalAmount: 50000, paidAmount: 0, dueDate: '2024-06-30', semester: 4, academicYear: '2024-25' },
      { studentId: students[0].id, feeType: 'hostel', totalAmount: 30000, paidAmount: 30000, dueDate, paymentMode: 'online', semester: 3, academicYear: '2024-25' },
    ]);
    logger.info('✅ Fees seeded');

    // ── 7. Attendance ─────────────────────────────
    const dates = ['2024-04-01', '2024-04-02', '2024-04-03'];
    const attendanceRecords = [];
    for (const date of dates) {
      attendanceRecords.push(
        { studentId: students[0].id, courseId: courses[0].id, date, status: 'present', markedBy: admin.id },
        { studentId: students[1].id, courseId: courses[0].id, date, status: date === '2024-04-02' ? 'absent' : 'present', markedBy: admin.id }
      );
    }
    await Attendance.bulkCreate(attendanceRecords);
    logger.info('✅ Attendance seeded');

    logger.info('');
    logger.info('─────────────────────────────────────────────');
    logger.info('🎉 Database seeded successfully!');
    logger.info('');
    logger.info('  Admin  →  admin@cms.edu  /  Admin@123');
    logger.info('  Staff  →  jane@cms.edu   /  Staff@123');
    logger.info('─────────────────────────────────────────────');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seed();
