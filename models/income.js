const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('new_expense_tracker', 'root', process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
});

const Income = sequelize.define('Income', {
  Income_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'incomes',
  timestamps: false,
});

module.exports = Income;
