import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config/env';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const payload = {
      email: formData.email,
      password: formData.password,
      role: 'personal',
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Account created! Please sign in.');
        navigate('/login');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Connection failed', error);
      alert('Server is down.');
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-sub-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </header>

      <div className="auth-container">
        <h1>Create an account</h1>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="name-row">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">
            Create Account
          </button>
        </form>
      </div>
    </div>
