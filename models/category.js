const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('new_expense_tracker', 'root', process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
});

const Category = sequelize.define('Category', {
  Category_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'categories',
  timestamps: false,
});

module.exports = Category;
