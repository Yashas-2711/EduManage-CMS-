'use strict';

require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,       
      min: 0,        
      acquire: 30000, 
      idle: 10000,   
    },
    define: {
      underscored: false,   
      timestamps: true,     
      paranoid: false,      
    },
  }
);

/**
 * Test the DB connection and sync models.
 * @param {boolean} force - Drop and re-create tables (use only in dev)
 */
const connectDB = async (force = false) => {
  try {
    await sequelize.authenticate();
    logger.info('✅  MySQL connected successfully.');

    await sequelize.sync({ alter: true, force });
    logger.info('✅  Database synchronized.');
  } catch (error) {
    logger.error(`❌  Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
