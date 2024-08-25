require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Sequelize
const sequelize = new Sequelize('new_expense_tracker', 'root', process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
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
Expense.belongsTo(User, { foreignKey: 'User_ID' });
Expense.belongsTo(Category, { foreignKey: 'Category_ID' });
Income.belongsTo(User, { foreignKey: 'User_ID' });
FinancialGoal.belongsTo(User, { foreignKey: 'User_ID' });

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log('Database synchronized.');
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { Email: email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user.User_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Forgot password route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry in user record
    user.resetToken = resetTokenHash;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `http://localhost:${PORT}/reset-password?token=${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested to reset the password for your account. Please make a PUT request to: \n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    await transporter.sendMail({
      to: email,
      subject: 'Password Reset',
      text: message,
    });

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Reset password route
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Find user by reset token
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpire: { [Op.gt]: Date.now() },
      },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password and save it
    user.Password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
const userRoutes = require('../routes/users'); 
const expenseRoutes = require('../routes/expenses');
const incomeRoutes = require('../routes/incomes');
const goalRoutes = require('../routes/goals');
const categoryRoutes = require('../routes/categories');

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 
  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Public routes
app.use('/users', userRoutes); 
app.use('/expenses', verifyToken, expenseRoutes);
app.use('/incomes', verifyToken, incomeRoutes);
app.use('/goals', verifyToken, goalRoutes);
app.use('/categories', verifyToken, categoryRoutes);

// Serve HTML pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/forgot-password.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Global error handling
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
