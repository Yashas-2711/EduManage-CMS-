'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Attendance model — daily attendance record per student per course.
 */
const Attendance = sequelize.define(
  'Attendance',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
      allowNull: false,
      defaultValue: 'present',
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    markedBy: {
      type: DataTypes.INTEGER, // userId who marked attendance
      allowNull: true,
    },
  },
  {
    tableName: 'attendance',
    indexes: [
      {
        // Prevent duplicate attendance records for same student/course/date
        unique: true,
        fields: ['studentId', 'courseId', 'date'],
      },
    ],
  }
);

module.exports = Attendance;
