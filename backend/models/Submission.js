// backend/models/Submission.js
const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  patientName: String,
  patientID: String,
  email: String,
  note: String,
  // original images
  imageUpperUrl: String,
  imageFrontUrl: String,
  imageLowerUrl: String,
  // annotation JSON (optional) and annotated image URLs
  annotationData: { type: Object, default: null }, // general annotation info
  annotatedUpperUrl: String,
  annotatedFrontUrl: String,
  annotatedLowerUrl: String,
  pdfUrl: String,
  status: { type: String, enum: ['uploaded','annotated','reported'], default: 'uploaded' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Submission', submissionSchema);
