// frontend/src/components/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateAndDownloadPdf } from '../utils/generatePdf';

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
    <div>
      <h3>Admin Dashboard</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {subs.map((s) => (
            <div key={s._id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <img src={s.imageUpperUrl} style={{ width: 120 }} alt="upper" />
                  <img src={s.imageFrontUrl} style={{ width: 120 }} alt="front" />
                  <img src={s.imageLowerUrl} style={{ width: 120 }} alt="lower" />
                </div>
                <div style={{ flex: 1 }}>
                  <div>
                    <b>{s.patientName}</b> ({s.patientID})
                  </div>
                  <div>Status: {s.status}</div>
                  <div>Uploaded: {new Date(s.createdAt).toLocaleString()}</div>
                  <div className="controls" style={{ marginTop: 8 }}>
                    <button className="btn" onClick={() => autoAnnotate(s._id)}>
                      Auto Annotate (Python)
                    </button>
                    <button className="btn" onClick={() => generateReport(s._id)}>
                      Generate PDF (Server)
                    </button>
                    {s.pdfUrl && (
                      <button className="btn" onClick={() => downloadReport(s._id)}>
                      Download Report
                    </button>
                    )}
                  </div>
                </div>
                <div style={{ width: 260 }}>
                  <h5>Annotated</h5>
                  {s.annotatedUpperUrl && (
                    <img src={s.annotatedUpperUrl} style={{ width: 220 }} alt="ann upper" />
                  )}
                  {s.annotatedFrontUrl && (
                    <img src={s.annotatedFrontUrl} style={{ width: 220 }} alt="ann front" />
                  )}
                  {s.annotatedLowerUrl && (
                    <img src={s.annotatedLowerUrl} style={{ width: 220 }} alt="ann lower" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
