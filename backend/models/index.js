'use strict';

/**
 * Central index for all Sequelize models.
 * Import this file everywhere you need models — it ensures associations are always set up.
 */

const User = require('./User');
const Student = require('./Student');
const Course = require('./Course');
const Marks = require('./Marks');
const Fees = require('./Fees');
const Attendance = require('./Attendance');
const StudentCourse = require('./StudentCourse');

// ─────────────────────────────────────────────────
// Associations
// ─────────────────────────────────────────────────

// User  →  Student  (1 : N)
User.hasMany(Student, { foreignKey: 'userId', as: 'students' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'registeredBy' });

// Student  ↔  Course  (N : M)  via StudentCourse
Student.belongsToMany(Course, {
  through: StudentCourse,
  foreignKey: 'studentId',
  as: 'courses',
});
Course.belongsToMany(Student, {
  through: StudentCourse,
  foreignKey: 'courseId',
  as: 'students',
});

// Direct access to the join table
Student.hasMany(StudentCourse, { foreignKey: 'studentId', as: 'enrollments' });
Course.hasMany(StudentCourse, { foreignKey: 'courseId', as: 'enrollments' });
StudentCourse.belongsTo(Student, { foreignKey: 'studentId' });
StudentCourse.belongsTo(Course, { foreignKey: 'courseId' });

// Student  →  Marks  (1 : N)
Student.hasMany(Marks, { foreignKey: 'studentId', as: 'marks', onDelete: 'CASCADE' });
Marks.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Course  →  Marks  (1 : N)
Course.hasMany(Marks, { foreignKey: 'courseId', as: 'marks', onDelete: 'CASCADE' });
Marks.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Student  →  Fees  (1 : N)
Student.hasMany(Fees, { foreignKey: 'studentId', as: 'fees', onDelete: 'CASCADE' });
Fees.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Student  →  Attendance  (1 : N)
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Course  →  Attendance  (1 : N)
Course.hasMany(Attendance, { foreignKey: 'courseId', as: 'attendance', onDelete: 'CASCADE' });
Attendance.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

module.exports = { User, Student, Course, Marks, Fees, Attendance, StudentCourse };
