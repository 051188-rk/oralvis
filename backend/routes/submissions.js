// backend/routes/submissions.js
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// helper to write temp file from URL
async function downloadToFile(url, outPath){
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.promises.writeFile(outPath, Buffer.from(resp.data), 'binary');
  return outPath;
}

// upload dataUri or file buffer to cloudinary (auto detect)
async function uploadDataUrl(dataUrl, options = {}){
  // dataUrl is like data:image/png;base64,...
  return await cloudinary.uploader.upload(dataUrl, options);
}

// ---------- PATIENT upload (3 images, image fields are dataURLs) ----------
router.post('/', requireAuth, async (req,res)=>{
  try{
    const { patientName, patientID, email, note, imageUpper, imageFront, imageLower } = req.body;
    if(!patientName || !imageUpper || !imageFront || !imageLower) return res.status(400).json({ message: 'Missing fields' });

    const up1 = await cloudinary.uploader.upload(imageUpper, { folder: 'oralvis-submissions' });
    const up2 = await cloudinary.uploader.upload(imageFront, { folder: 'oralvis-submissions' });
    const up3 = await cloudinary.uploader.upload(imageLower, { folder: 'oralvis-submissions' });

    const sub = await Submission.create({
      patientName, patientID, email, note,
      imageUpperUrl: up1.secure_url,
      imageFrontUrl: up2.secure_url,
      imageLowerUrl: up3.secure_url,
      createdBy: req.user._id,
      status: 'uploaded'
    });
    res.json(sub);
  }catch(e){
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// get all (admin)
router.get('/', requireAuth, requireAdmin, async (req,res)=>{
  const subs = await Submission.find().sort({ createdAt: -1 });
  res.json(subs);
});

// get mine (patient)
router.get('/mine', requireAuth, async (req,res)=>{
  const subs = await Submission.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json(subs);
});

// get single
router.get('/:id', requireAuth, async (req,res)=>{
  const sub = await Submission.findById(req.params.id);
  if(!sub) return res.status(404).json({ message: 'Not found' });
  if(req.user.role !== 'admin' && (!sub.createdBy || sub.createdBy.toString() !== req.user._id.toString()))
    return res.status(403).json({ message: 'Forbidden' });
  res.json(sub);
});

// manual annotate (keeps previous behavior) - admin uploads annotated image(s)
router.put('/:id/annotate', requireAuth, requireAdmin, async (req,res)=>{
  try{
    const { annotationData, annotatedUpper, annotatedFront, annotatedLower } = req.body;
    const sub = await Submission.findById(req.params.id);
    if(!sub) return res.status(404).json({ message: 'Not found' });

    if(annotatedUpper){
      const up = await cloudinary.uploader.upload(annotatedUpper, { folder: 'oralvis-annotated' });
      sub.annotatedUpperUrl = up.secure_url;
    }
    if(annotatedFront){
      const up = await cloudinary.uploader.upload(annotatedFront, { folder: 'oralvis-annotated' });
      sub.annotatedFrontUrl = up.secure_url;
    }
    if(annotatedLower){
      const up = await cloudinary.uploader.upload(annotatedLower, { folder: 'oralvis-annotated' });
      sub.annotatedLowerUrl = up.secure_url;
    }
    sub.annotationData = annotationData || sub.annotationData;
    sub.status = 'annotated';
    await sub.save();
    res.json(sub);
  }catch(e){ res.status(500).json({ message: e.message }); }
});

// ---------------- NEW ROUTE: auto-annotate via Python script ----------------
router.post('/:id/auto-annotate', requireAuth, requireAdmin, async (req,res)=>{
  try{
    const sub = await Submission.findById(req.params.id);
    if(!sub) return res.status(404).json({ message: 'Not found' });

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'oralvis-'));
    const inUpper = path.join(tmpdir, 'in_upper.' + (sub.imageUpperUrl.split('.').pop().split('?')[0] || 'jpg'));
    const inFront = path.join(tmpdir, 'in_front.' + (sub.imageFrontUrl.split('.').pop().split('?')[0] || 'jpg'));
    const inLower = path.join(tmpdir, 'in_lower.' + (sub.imageLowerUrl.split('.').pop().split('?')[0] || 'jpg'));
    await downloadToFile(sub.imageUpperUrl, inUpper);
    await downloadToFile(sub.imageFrontUrl, inFront);
    await downloadToFile(sub.imageLowerUrl, inLower);

    const outUpper = path.join(tmpdir, 'out_upper.png');
    const outFront = path.join(tmpdir, 'out_front.png');
    const outLower = path.join(tmpdir, 'out_lower.png');

    const pythonPath = process.env.PYTHON_BIN || 'python';
    const scriptPath = path.join(__dirname, '..', 'python', 'app.py');

    await new Promise((resolve, reject) => {
      const args = [ scriptPath, '--in_upper', inUpper, '--in_front', inFront, '--in_lower', inLower, '--out_upper', outUpper, '--out_front', outFront, '--out_lower', outLower ];
      const child = spawn(pythonPath, args, { stdio: 'inherit' });
      child.on('error', err => reject(err));
      child.on('close', code => {
        if(code === 0) resolve();
        else reject(new Error('Python annotator exited with code ' + code));
      });
    });

    const up1 = await cloudinary.uploader.upload(outUpper, { folder: 'oralvis-annotated' });
    const up2 = await cloudinary.uploader.upload(outFront, { folder: 'oralvis-annotated' });
    const up3 = await cloudinary.uploader.upload(outLower, { folder: 'oralvis-annotated' });

    sub.annotatedUpperUrl = up1.secure_url;
    sub.annotatedFrontUrl = up2.secure_url;
    sub.annotatedLowerUrl = up3.secure_url;
    sub.status = 'annotated';
    await sub.save();

    try {
      fs.unlinkSync(inUpper); fs.unlinkSync(inFront); fs.unlinkSync(inLower);
      fs.unlinkSync(outUpper); fs.unlinkSync(outFront); fs.unlinkSync(outLower);
      fs.rmdirSync(tmpdir);
    } catch(e){ /* ignore cleanup errors */ }

    res.json(sub);
  }catch(e){
    console.error('Auto-annotate error', e);
    res.status(500).json({ message: e.message });
  }
});

// ---------------- FINALIZED PDF generation endpoint ----------------
router.post('/:id/report', requireAuth, requireAdmin, async (req,res)=>{
  try{
    const sub = await Submission.findById(req.params.id);
    if(!sub) return res.status(404).json({ message: 'Not found' });

    if(sub.status !== 'annotated'){
      return res.status(400).json({ message: 'Report can only be generated after annotation' });
    }

    // PDF Generation
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Header
    const headerColor = rgb(155/255, 89/255, 182/255);
    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: headerColor });
    page.drawText('Oral Health Screening Report', { x: 150, y: height - 50, font: boldFont, size: 22, color: rgb(1, 1, 1) });

    let y = height - 120;
    // Patient Details
    page.drawText(`Name: ${sub.patientName}`, { x: 40, y, font, size: 12 });
    page.drawText(`Patient ID: ${sub.patientID || ''}`, { x: 300, y, font, size: 12 });
    y -= 20;
    page.drawText(`Date: ${new Date(sub.createdAt).toLocaleDateString()}`, { x: 40, y, font, size: 12 });
    y -= 40;

    const embedImageFromUrl = async (url) => {
      if(!url) return null;
      const resp = await axios.get(url, { responseType: 'arraybuffer' });
      const type = resp.headers['content-type'];
      if(type.includes('png')) return await pdfDoc.embedPng(resp.data);
      return await pdfDoc.embedJpg(resp.data);
    };

    const annUpper = await embedImageFromUrl(sub.annotatedUpperUrl);
    const annFront = await embedImageFromUrl(sub.annotatedFrontUrl);
    const annLower = await embedImageFromUrl(sub.annotatedLowerUrl);

    y -= 140;
    const imgW = 160, imgH = 120, gap = (width - 80 - 3*imgW) / 2;
    let x = 40;
    if(annUpper) page.drawImage(annUpper, { x, y, width: imgW, height: imgH });
    x += imgW + gap;
    if(annFront) page.drawImage(annFront, { x, y, width: imgW, height: imgH });
    x += imgW + gap;
    if(annLower) page.drawImage(annLower, { x, y, width: imgW, height: imgH });

    y -= 40;
    page.drawText('TREATMENT RECOMMENDATIONS:', { x: 40, y, font: boldFont, size: 12 });
    y -= 20;
    page.drawText('Based on observations, please visit your dentist for a detailed consultation.', { x: 40, y, font, size: 10 });

    const pdfBytes = await pdfDoc.save();
    const dataUri = 'data:application/pdf;base64,' + Buffer.from(pdfBytes).toString('base64');
    
    // --- FIX: Add access_mode: 'public' to make the PDF downloadable ---
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      folder: "oralvis-reports",
      public_id: `report_${sub._id}`,
      format: "pdf",
      access_mode: 'public' // This makes the file's URL directly accessible
    });

    sub.pdfUrl = uploaded.secure_url;
    sub.status = 'reported';
    await sub.save();
    res.json(sub);

  }catch(e){
    console.error('report error', e);
    res.status(500).json({ message: e.message });
  }
});



module.exports = router;