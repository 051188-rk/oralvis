require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const seedAdmin = require('./seed');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI, { })
  .then(async ()=>{
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, ()=> console.log('Server running on port', PORT));
  })
  .catch(err=> {
    console.error('MongoDB connection error', err);
  });
