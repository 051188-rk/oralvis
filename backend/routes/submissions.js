const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const { PDFDocument } = require('pdf-lib');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Patient upload
router.post('/', requireAuth, async (req,res)=>{
  try{
    // expecting: name, patientID, email, note, image (dataURL or multipart file)
    const { patientName, patientID, email, note, image } = req.body;
    if(!patientName || !image) return res.status(400).json({ message: 'Missing required fields' });
    // Image should be dataURL (base64) sent from frontend
    const uploaded = await cloudinary.uploader.upload(image, { folder: 'oralvis-submissions' });
    const sub = await Submission.create({
      patientName, patientID, email, note,
      imageUrl: uploaded.secure_url, createdBy: req.user._id, status: 'uploaded'
    });
    res.json(sub);
  }catch(e){
    res.status(500).json({ message: e.message });
  }
});

// Get all submissions (admin)
router.get('/', requireAuth, requireAdmin, async (req,res)=>{
  const subs = await Submission.find().sort({ createdAt: -1 });
  res.json(subs);
});

// Get my submissions (patient)
router.get('/mine', requireAuth, async (req,res)=>{
  const subs = await Submission.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json(subs);
});

// Get single
router.get('/:id', requireAuth, async (req,res)=>{
  const sub = await Submission.findById(req.params.id);
  if(!sub) return res.status(404).json({ message: 'Not found' });
  // access control
  if(req.user.role !== 'admin' && (!sub.createdBy || sub.createdBy.toString() !== req.user._id.toString()))
    return res.status(403).json({ message: 'Forbidden' });
  res.json(sub);
});

// Annotate (admin): expects annotationData (JSON) and annotatedImage (dataURL)
router.put('/:id/annotate', requireAuth, requireAdmin, async (req,res)=>{
  try{
    const { annotationData, annotatedImage } = req.body;
    const sub = await Submission.findById(req.params.id);
    if(!sub) return res.status(404).json({ message: 'Not found' });
    let annUrl = null;
    if(annotatedImage){
      const uploaded = await cloudinary.uploader.upload(annotatedImage, { folder: 'oralvis-annotated' });
      annUrl = uploaded.secure_url;
    }
    sub.annotationData = annotationData || sub.annotationData;
    sub.annotatedImageUrl = annUrl || sub.annotatedImageUrl;
    sub.status = 'annotated';
    await sub.save();
    res.json(sub);
  }catch(e){
    res.status(500).json({ message: e.message });
  }
});

// Generate PDF (admin) - creates PDF with details and both images, uploads to Cloudinary (raw)
router.post('/:id/report', requireAuth, requireAdmin, async (req,res)=>{
  try{
    const sub = await Submission.findById(req.params.id);
    if(!sub) return res.status(404).json({ message: 'Not found' });
    // create PDF with pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const left = 40;
    let y = height - 60;
    page.drawText('OralVis Report', { x: left, y, size: 18 });
    y -= 30;
    page.drawText(`Patient Name: ${sub.patientName}`, { x: left, y, size: 12 });
    y -= 18;
    page.drawText(`Patient ID: ${sub.patientID || ''}`, { x: left, y, size: 12 });
    y -= 18;
    page.drawText(`Email: ${sub.email || ''}`, { x: left, y, size: 12 });
    y -= 18;
    page.drawText(`Uploaded: ${sub.createdAt.toISOString()}`, { x: left, y, size: 10 });
    y -= 22;
    page.drawText('Notes:', { x: left, y, size: 12 });
    y -= 16;
    const note = (sub.note || '').slice(0, 1000);
    page.drawText(note, { x: left, y, size: 10, maxWidth: 520 });
    // embed images if present
    const embedImageFromUrl = async (url) => {
      if(!url) return null;
      const resp = await axios.get(url, { responseType: 'arraybuffer' });
      const type = resp.headers['content-type'];
      if(type === 'image/png') return await pdfDoc.embedPng(resp.data);
      return await pdfDoc.embedJpg(resp.data);
    };
    const origImg = await embedImageFromUrl(sub.imageUrl);
    if(origImg){
      y -= 220;
      page.drawImage(origImg, { x: left, y, width: 250, height: 200 });
    }
    if(sub.annotatedImageUrl){
      const annImg = await embedImageFromUrl(sub.annotatedImageUrl);
      if(annImg){
        page.drawImage(annImg, { x: left + 280, y: y, width: 250, height: 200 });
      }
    }
    const pdfBytes = await pdfDoc.save();
    // upload to Cloudinary as raw
    const uploadResult = await cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'oralvis-reports' }, (err,result)=>{
      if(err) throw err;
      return result;
    });
    // cloudinary.uploader.upload_stream returns a writable stream; workaround: use uploader.upload with data uri via buffer
    const dataUri = 'data:application/pdf;base64,' + Buffer.from(pdfBytes).toString('base64');
    const uploaded = await cloudinary.uploader.upload(dataUri, { resource_type: 'raw', folder: 'oralvis-reports' });
    sub.pdfUrl = uploaded.secure_url;
    sub.status = 'reported';
    await sub.save();
    res.json(sub);
  }catch(e){
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
