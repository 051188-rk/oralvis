import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnnotationCanvas from './AnnotationCanvas';
import { Link } from 'react-router-dom';

export default function AdminDashboard(){
  const { authAxios } = useAuth();
  const [subs, setSubs] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(()=> load(), []);
  const load = async ()=>{
    try{ const res = await authAxios.get('/api/submissions'); setSubs(res.data); }catch(e){ console.log(e); }
  };

  const open = (s)=> setActive(s);

  const onAnnotatedSaved = (updated)=>{
    setSubs(list=> list.map(l=> l._id===updated._id ? updated: l));
    setActive(updated);
  };

  const generateReport = async (id)=>{
    if(!window.confirm('Generate PDF report?')) return;
    try{
      const res = await authAxios.post(`/api/submissions/${id}/report`);
      alert('Report generated');
      setSubs(list=> list.map(l=> l._id===res.data._id ? res.data : l));
      setActive(res.data);
    }catch(e){
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <h3>Admin Dashboard</h3>
      <div style={{display:'flex', gap:12}}>
        <div style={{flex:1}}>
          {subs.map(s=>(
            <div key={s._id} className='card' style={{marginBottom:8}}>
              <div style={{display:'flex', gap:12}}>
                <img src={s.imageUrl} style={{width:120}} alt='orig' />
                <div style={{flex:1}}>
                  <div><b>{s.patientName}</b> ({s.patientID})</div>
                  <div>Status: {s.status}</div>
                  <div>Uploaded: {new Date(s.createdAt).toLocaleString()}</div>
                  <div className='controls'>
                    <button className='btn' onClick={()=> open(s)}>Annotate</button>
                    <button className='btn' onClick={()=> generateReport(s._id)}>Generate PDF</button>
                    {s.pdfUrl && <a className='btn' href={s.pdfUrl} target='_blank' rel='noreferrer'>View PDF</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{width:520}}>
          {active ? <AnnotationCanvas submission={active} onSaved={onAnnotatedSaved} /> : <div className='card'>Select a submission to annotate</div>}
        </div>
      </div>
    </div>
  );
}
