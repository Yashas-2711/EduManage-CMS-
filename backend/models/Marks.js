'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Marks model — stores internal + external marks per subject per student.
 */
const Marks = sequelize.define(
  'Marks',
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
    examType: {
      type: DataTypes.ENUM('internal', 'external', 'practical', 'assignment'),
      allowNull: false,
      defaultValue: 'internal',
    },
    marksObtained: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    maxMarks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100,
      validate: { min: 1 },
    },
    // Computed field — stored for quick queries
    percentage: {
      type: DataTypes.VIRTUAL,
      get() {
        const obtained = parseFloat(this.marksObtained) || 0;
        const max = parseFloat(this.maxMarks) || 1;
        return ((obtained / max) * 100).toFixed(2);
      },
    },
    grade: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    examDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'marks',
    hooks: {
      // Auto-calculate grade before saving
      beforeSave: (mark) => {
        const pct = (parseFloat(mark.marksObtained) / parseFloat(mark.maxMarks)) * 100;
        if (pct >= 90) mark.grade = 'A+';
        else if (pct >= 80) mark.grade = 'A';
        else if (pct >= 70) mark.grade = 'B+';
        else if (pct >= 60) mark.grade = 'B';
        else if (pct >= 50) mark.grade = 'C';
        else if (pct >= 40) mark.grade = 'D';
        else mark.grade = 'F';
      },
    },
  }
);

module.exports = Marks;
