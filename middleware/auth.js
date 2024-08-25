const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Access the 'Authorization' header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: 'Token is required' });
    }

    // Check if the header starts with 'Bearer '
    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
        return res.status(403).json({ message: 'Invalid token format' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use secret from environment variable
        req.userId = decoded.userId;
        req.userRole = decoded.role; // Assuming the role is included in the token
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
   
    verifyToken(req, res, next);
};

// Middleware to check user role (if applicable)
const checkRole = (role) => {
    return (req, res, next) => {
       
        if (!req.userRole) {
            return res.status(403).json({ message: 'Role information is missing' });
        }

        if (req.userRole !== role) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};

module.exports = { verifyToken, isAuthenticated, checkRole };
