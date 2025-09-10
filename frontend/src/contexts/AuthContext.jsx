import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children })=>{
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(()=> localStorage.getItem('token') || null);

  useEffect(()=>{
    if(token) localStorage.setItem('token', token); else localStorage.removeItem('token');
    if(user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [token, user]);

  const login = (token, user)=>{
    setToken(token); setUser(user);
  };
  const logout = ()=>{ setToken(null); setUser(null); };

  const authAxios = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000' });
  authAxios.interceptors.request.use(cfg=>{
    if(token) cfg.headers.Authorization = 'Bearer ' + token;
    return cfg;
  });

  return <AuthContext.Provider value={{ user, token, login, logout, authAxios }}>{children}</AuthContext.Provider>;
};

export const useAuth = ()=> useContext(AuthContext);
