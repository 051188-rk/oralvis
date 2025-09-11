// frontend/src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadPdf } from '../utils/generatePdf';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { authAxios } = useAuth();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await authAxios.get('/api/submissions');
      setSubs(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  const autoAnnotate = async (id) => {
    if (!window.confirm('Auto annotate this submission?')) return;
    try {
      const res = await authAxios.post(`/api/submissions/${id}/auto-annotate`);
      alert('Annotated by Python script');
      setSubs((list) => list.map((l) => (l._id === res.data._id ? res.data : l)));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const generateReport = async (id) => {
    if (!window.confirm('Generate PDF on server?')) return;
    try {
      const res = await authAxios.post(`/api/submissions/${id}/report`);
      alert('Report generated & uploaded');
      setSubs((list) => list.map((l) => (l._id === res.data._id ? res.data : l)));
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const downloadReport = async (submissionId) => {
    try {
      // 1. Fetch the full submission details first
      const res = await authAxios.get(`/api/submissions/${submissionId}`);
      const fullSubmission = res.data;

      // 2. Check if it's ready for a report
      if (!fullSubmission.annotatedUpperUrl || !fullSubmission.annotatedFrontUrl || !fullSubmission.annotatedLowerUrl) {
        alert('This submission has not been fully annotated yet.');
        return;
      }

      // 3. Generate the PDF on the client-side
      generateAndDownloadPdf(fullSubmission);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h3>Admin Dashboard</h3>
      <div>
        {subs.map((s) => (
          <div key={s._id} className="submission-card">
            <div className="submission-images">
              <img src={s.imageUpperUrl} alt="upper" />
              <img src={s.imageFrontUrl} alt="front" />
              <img src={s.imageLowerUrl} alt="lower" />
            </div>
            <div className="submission-details">
              <div>
                <b>{s.patientName}</b> ({s.patientID})
              </div>
              <div>Status: {s.status}</div>
              <div>Uploaded: {new Date(s.createdAt).toLocaleString()}</div>
              <div className="submission-controls">
                <button className="btn" onClick={() => autoAnnotate(s._id)}>
                  Auto Annotate
                </button>
                <button className="btn" onClick={() => generateReport(s._id)}>
                  Generate PDF
                </button>
                {s.pdfUrl && (
                  <button className="btn primary" onClick={() => downloadReport(s._id)}>
                    Download Report
                  </button>
                )}
              </div>
            </div>
            <div className="annotated-images">
              <h5>Annotated</h5>
              {s.annotatedUpperUrl && <img src={s.annotatedUpperUrl} alt="ann upper" />}
              {s.annotatedFrontUrl && <img src={s.annotatedFrontUrl} alt="ann front" />}
              {s.annotatedLowerUrl && <img src={s.annotatedLowerUrl} alt="ann lower" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}