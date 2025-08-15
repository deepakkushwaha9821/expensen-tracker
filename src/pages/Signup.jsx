import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', form);

      // Dispatch to Redux
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));

      // Save in localStorage (optional)
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);

      // Redirect to Dashboard
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Signup failed!');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="h2">Create account</h2>
        <form className="form mt-24" onSubmit={handleSubmit}>
          <input type="text" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button className="btn">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
