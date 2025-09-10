const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
  patientName: String,
  patientID: String,
  email: String,
  note: String,
  imageUrl: String,
  annotationData: { type: Object, default: null },
  annotatedImageUrl: String,
  pdfUrl: String,
  status: { type: String, enum: ['uploaded','annotated','reported'], default: 'uploaded' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Submission', submissionSchema);
