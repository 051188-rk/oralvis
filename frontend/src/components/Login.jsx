// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const nav = useNavigate();
  const { login } = useAuth();

  const handle = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/auth/login',
        form
      );
      const { token, user } = res.data;
      login(token, user);
      alert('Logged in as ' + user.role);
      if (user.role === 'admin') nav('/admin');
      else nav('/upload');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.png" alt="Logo" />
      <div className="card login-form">
        <h3>Login</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required />
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn primary" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}