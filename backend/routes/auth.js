const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    if(!name||!email||!password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ message: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: role||'patient' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  }catch(e){
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email||!password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  }catch(e){
    res.status(500).json({ message: e.message });
  }
});

router.post('/logout', async (req,res)=>{
  // JWT is stateless; frontend should clear localStorage
  res.json({ message: 'Logged out' });
});

module.exports = router;
