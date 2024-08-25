const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('new_expense_tracker', 'root', process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
});

const FinancialGoal = sequelize.define('FinancialGoal', {
  Goal_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  TargetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  StartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  EndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'financial_goals',
  timestamps: false,
});

module.exports = FinancialGoal;
