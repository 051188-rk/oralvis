import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PatientForm(){
  const { user, authAxios } = useAuth();
  const [form, setForm] = useState({ patientName:'', patientID:'', email:'', note:'', imageFile:null });
  const [mine, setMine] = useState([]);

  useEffect(()=>{ if(user) setForm(f=>({...f, patientName: user.name, email: user.email})); loadMine(); }, []);

  const loadMine = async ()=>{
    try{ const res = await authAxios.get('/api/submissions/mine'); setMine(res.data); }catch(e){ console.log(e); }
  };

  const handleFile = e => {
    const file = e.target.files[0];
    setForm(f=>({...f, imageFile: file}));
  };

  const submit = async (e)=>{
    e.preventDefault();
    if(!form.imageFile){ alert('Add image'); return; }
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const payload = {
          patientName: form.patientName,
          patientID: form.patientID,
          email: form.email,
          note: form.note,
          image: reader.result
        };
        await authAxios.post('/api/submissions', payload);
        alert('Uploaded');
        setForm(f=>({...f, patientID:'', note:'', imageFile:null}));
        loadMine();
      }catch(err){
        alert(err.response?.data?.message || err.message);
      }
    };
    reader.readAsDataURL(form.imageFile);
  };

  return (
    <div>
      <div className='card form'>
        <h3>Upload Submission</h3>
        <form onSubmit={submit}>
          <label>Name</label>
          <input name='patientName' value={form.patientName} onChange={e=>setForm({...form, patientName: e.target.value})} required />
          <label>Patient ID</label>
          <input name='patientID' value={form.patientID} onChange={e=>setForm({...form, patientID: e.target.value})} />
          <label>Email</label>
          <input name='email' value={form.email} onChange={e=>setForm({...form, email: e.target.value})} type='email' />
          <label>Note</label>
          <textarea value={form.note} onChange={e=>setForm({...form, note: e.target.value})} />
          <label>Image (JPEG/PNG)</label>
          <input type='file' accept='image/png, image/jpeg' onChange={handleFile} />
          <div style={{marginTop:12}}><button className='btn primary' type='submit'>Upload</button></div>
        </form>
      </div>

      <div className='card'>
        <h4>My Submissions</h4>
        <div className='list'>
          {mine.map(s=>(
            <div key={s._id} className='submission card'>
              <img src={s.imageUrl} alt='orig' />
              <div>
                <div><b>{s.patientName}</b> ({s.patientID})</div>
                <div>Status: {s.status}</div>
                <div>Uploaded: {new Date(s.createdAt).toLocaleString()}</div>
                {s.pdfUrl && <div><a href={s.pdfUrl} target='_blank' rel='noreferrer'>Download Report</a></div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
