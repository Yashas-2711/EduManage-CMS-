'use strict';

/**
 * StudentCourse — join table for the N:M relationship between Students and Courses.
 * Allows extra fields like enrollmentDate and grade on the association.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentCourse = sequelize.define(
  'StudentCourse',
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
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('enrolled', 'completed', 'dropped'),
      defaultValue: 'enrolled',
    },
  },
  {
    tableName: 'student_courses',
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'courseId'],
      },
    ],
  }
);

module.exports = StudentCourse;
