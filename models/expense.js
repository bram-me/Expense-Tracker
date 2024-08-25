const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('new_expense_tracker', 'root', process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
});

const Expense = sequelize.define('Expense', {
  Expense_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Category_ID: {
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
  tableName: 'expenses',
  timestamps: false,
});

module.exports = Expense;
