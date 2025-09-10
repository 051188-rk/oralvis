const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.requireAuth = async (req,res,next)=>{
  try{
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if(!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({ message: 'Unauthorized', error: e.message });
  }
};

exports.requireAdmin = (req,res,next)=>{
  if(req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin only' });
};
