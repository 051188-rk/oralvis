// src/components/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const nav = useNavigate();

  const handle = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/auth/register',
        form
      );
      alert('Registered. Please login.');
      nav('/login');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="register-container">
      <img src="/logo.png" alt="Logo" />
      <div className="card register-form">
        <h3>Register</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handle} required />
          </div>
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
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}