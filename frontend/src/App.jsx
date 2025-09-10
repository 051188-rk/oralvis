import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import PatientForm from './components/PatientForm';
import AdminDashboard from './components/AdminDashboard';
import PDFViewer from './components/PDFViewer';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Navbar(){
  const { user, logout } = useAuth();
  return (
    <nav className='nav'>
      <Link to='/' className='brand'>OralVis</Link>
      <div>
        {!user && <><Link to='/login'>Login</Link> <Link to='/register'>Register</Link></>}
        {user && user.role==='patient' && <Link to='/upload'>My Uploads</Link>}
        {user && user.role==='admin' && <Link to='/admin'>Admin</Link>}
        {user && <button className='btn link' onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
}

export default function App(){
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className='container'>
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/upload' element={<PatientForm/>} />
            <Route path='/admin' element={<AdminDashboard/>} />
            <Route path='/pdf/:id' element={<PDFViewer/>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function Home(){
  return (
    <div style={{padding:20}}>
      <h2>Welcome to OralVis</h2>
      <p>Use the app to upload patient images (patients) and annotate & generate reports (admins).</p>
      <p>Default admin: <b>admin@oralvis.com</b> / <b>oraladmin</b></p>
    </div>
  );
}
