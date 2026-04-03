'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Fees model — tracks fee records for each student.
 */
const Fees = sequelize.define(
  'Fees',
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
    feeType: {
      type: DataTypes.ENUM('tuition', 'hostel', 'library', 'exam', 'other'),
      allowNull: false,
      defaultValue: 'tuition',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: { min: 0 },
    },
    // Virtual computed field
    pendingAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        return (parseFloat(this.totalAmount) - parseFloat(this.paidAmount)).toFixed(2);
      },
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paymentMode: {
      type: DataTypes.ENUM('cash', 'online', 'cheque', 'dd'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('paid', 'pending', 'partial', 'overdue'),
      defaultValue: 'pending',
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    academicYear: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  },
  {
    tableName: 'fees',
    hooks: {
      // Auto-update status based on paid amount
      beforeSave: (fee) => {
        const total = parseFloat(fee.totalAmount) || 0;
        const paid = parseFloat(fee.paidAmount) || 0;
        if (paid >= total) fee.status = 'paid';
        else if (paid > 0) fee.status = 'partial';
        else {
          const today = new Date();
          const due = fee.dueDate ? new Date(fee.dueDate) : null;
          fee.status = due && today > due ? 'overdue' : 'pending';
        }
      },
    },
  }
);

module.exports = Fees;
