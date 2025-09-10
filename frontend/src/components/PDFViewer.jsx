import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function PDFViewer(){
  const { id } = useParams();
  const { authAxios } = useAuth();
  const [sub, setSub] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      try{ const res = await authAxios.get('/api/submissions/' + id); setSub(res.data); }catch(e){ console.log(e); }
    };
    load();
  }, [id]);

  if(!sub) return <div>Loading...</div>;
  return (
    <div className='card'>
      <h3>Report for {sub.patientName}</h3>
      {sub.pdfUrl ? <iframe title='pdf' src={sub.pdfUrl} style={{width:'100%', height:600}} /> : <div>No PDF yet</div>}
    </div>
  );
}
