// frontend/src/components/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadPdf } from '../utils/generatePdf';
import './PatientForm.css';

export default function PatientForm() {
  const { user, authAxios } = useAuth();
  const [form, setForm] = useState({
    patientName: '',
    patientID: '',
    email: '',
    note: '',
    upper: null,
    front: null,
    lower: null,
  });
  const [mine, setMine] = useState([]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, patientName: user.name, email: user.email }));
    loadMine();
  }, []);

  const loadMine = async () => {
    try {
      const res = await authAxios.get('/api/submissions/mine');
      setMine(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleFile = (e, which) => {
    const file = e.target.files[0];
    setForm((f) => ({ ...f, [which]: file }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.upper || !form.front || !form.lower) {
      alert('Please upload all three images');
      return;
    }

    const toDataUrl = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

    try {
      const up = await toDataUrl(form.upper);
      const fr = await toDataUrl(form.front);
      const lo = await toDataUrl(form.lower);
      const payload = {
        patientName: form.patientName,
        patientID: form.patientID,
        email: form.email,
        note: form.note,
        imageUpper: up,
        imageFront: fr,
        imageLower: lo,
      };
      await authAxios.post('/api/submissions', payload);
      alert('Uploaded');
      setForm({ ...form, patientID: '', note: '', upper: null, front: null, lower: null });
      loadMine();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const downloadReport = (submission) => {
    // Check if it's ready for a report
    if (!submission.annotatedUpperUrl || !submission.annotatedFrontUrl || !submission.annotatedLowerUrl) {
      alert('Your report is not ready yet. The status must be "annotated" or "reported".');
      return;
    }
    // Generate the PDF directly using the submission data
    generateAndDownloadPdf(submission);
  };

  return (
    <div className="patient-form-container">
      <div className="card form-card">
        <h3>Upload Submission (Upper, Front, Lower)</h3>
        <form onSubmit={submit} className="patient-form">
          <label>Name</label>
          <input
            name="patientName"
            value={form.patientName}
            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            required
          />
          <label>Patient ID</label>
          <input
            name="patientID"
            value={form.patientID}
            onChange={(e) => setForm({ ...form, patientID: e.target.value })}
          />
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
          />
          <label>Note</label>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <label>Upper Teeth (JPEG/PNG)</label>
          <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFile(e, 'upper')} />
          <label>Front Teeth (JPEG/PNG)</label>
          <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFile(e, 'front')} />
          <label>Lower Teeth (JPEG/PNG)</label>
          <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFile(e, 'lower')} />
          <div style={{ marginTop: 20 }}>
            <button className="btn primary" type="submit">
              Upload
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h4>My Submissions</h4>
        <div className="my-submissions-list">
          {mine.map((s) => (
            <div key={s._id} className="submission card">
              <div className="submission-images">
                <img src={s.imageUpperUrl} alt="upper" />
                <img src={s.imageFrontUrl} alt="front" />
                <img src={s.imageLowerUrl} alt="lower" />
              </div>
              <div className="submission-info">
                <div>
                  <b>{s.patientName}</b> ({s.patientID})
                </div>
                <div>Status: {s.status}</div>
                <div>Uploaded: {new Date(s.createdAt).toLocaleString()}</div>
                {s.pdfUrl && (
                  <button className="btn" onClick={() => downloadReport(s)}>
                    Download Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}