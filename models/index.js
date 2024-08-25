const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs'); // Ensure bcrypt is imported
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Disable logging if not needed
});

// Define models
const User = sequelize.define('User', {
  User_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Validate email format
    },
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.Password) {
        user.Password = await bcrypt.hash(user.Password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.Password) {
        user.Password = await bcrypt.hash(user.Password, 10);
      }
    },
  },
});

const Income = sequelize.define('Income', {
  Income_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  Source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'User_ID',
    },
    allowNull: false,
  },
}, {
  tableName: 'incomes',
  timestamps: true,
});

const Expense = sequelize.define('Expense', {
  Expense_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Category_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'User_ID',
    },
    allowNull: false,
  },
}, {
  tableName: 'expenses',
  timestamps: true,
});

const FinancialGoal = sequelize.define('FinancialGoal', {
  Goal_ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  User_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'User_ID',
    },
    allowNull: false,
  },
  Goal_Description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Target_Amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  Deadline_Date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Achieved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'financial_goals',
  timestamps: true,
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

// Define associations
User.hasMany(Income, { foreignKey: 'User_ID' });
Income.belongsTo(User, { foreignKey: 'User_ID' });

User.hasMany(Expense, { foreignKey: 'User_ID' });
Expense.belongsTo(User, { foreignKey: 'User_ID' });

User.hasMany(FinancialGoal, { foreignKey: 'User_ID' });
FinancialGoal.belongsTo(User, { foreignKey: 'User_ID' });

Category.hasMany(Expense, { foreignKey: 'Category_ID' });
Expense.belongsTo(Category, { foreignKey: 'Category_ID' });

// Sync all models
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database & tables updated!');
  })
  .catch(err => {
    console.error('Error updating database & tables:', err.message, err.stack);
  });

module.exports = { sequelize, User, Income, Expense, FinancialGoal, Category };
