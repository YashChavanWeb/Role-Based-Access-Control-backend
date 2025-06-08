import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// to verify user token
const verifyToken = (req, res, next) => {
  // Bearer token
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided, unauthorized access' });

  // if we get the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

export default verifyToken;
