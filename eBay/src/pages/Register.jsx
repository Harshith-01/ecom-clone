import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config/env';

function Register() {
   const navigate = useNavigate();
  const [role, setRole] = useState('personal');

    
   const [formData, setFormData] = useState({
     firstName: '', lastName: '', businessName: '',
     email: '', password: '', businessLocation: 'US'
	});

  const handleChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
   	e.preventDefault();

        
	   const payload = {
        email: formData.email,
  	  password: formData.password,
        role: role,
            
	     ...(role === 'personal' 
       	? { firstName: formData.firstName, lastName: formData.lastName } 
   	     : { businessName: formData.businessName, businessLocation: formData.businessLocation }
       )
     };

     try {
	  const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: 'POST',
     	   headers: { 'Content-Type': 'application/json' },
	       body: JSON.stringify(payload)
       });

       const data = await response.json();

	     if (response.ok) {
        	alert("Account created! Please sign in.");
  	     navigate('/login');
        } else {
     	   alert("Error: " + data.message);
	     }
     } catch (error) {
   	   console.error("Connection failed", error);
       alert("Server is down.");
     }
	};

  return (
     <div className="auth-page">
     	<header className="auth-header">
	       <div className="auth-sub-link">Already have an account? <Link to="/login">Sign in</Link></div>
       </header>

       <div className="auth-container">
     	  <h1>Create an account</h1>
                
                
  	     <div className="role-selection">
          	<label className="radio-label">
     	        <input type="radio" name="role" value="personal" checked={role === 'personal'} onChange={(e) => setRole(e.target.value)} /> Personal Account
	          </label>
       	  <label className="radio-label">
   	          <input type="radio" name="role" value="business" checked={role === 'business'} onChange={(e) => setRole(e.target.value)} /> Business Account
          	</label>
     	  </div>

        	<form className="auth-form" onSubmit={handleRegister}>
  	       {role === 'personal' ? (
          	  <div className="name-row">
     	          <input type="text" name="firstName" placeholder="First name" onChange={handleChange} required />
	          	   <input type="text" name="lastName" placeholder="Last name" onChange={handleChange} required />
       	     </div>
   	        ) : (
          	   <input type="text" name="businessName" placeholder="Business name" onChange={handleChange} required />
     	     )}

        	   <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
  	       <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

     	     {role === 'business' && (
	          	<select className="location-select" name="businessLocation" onChange={handleChange}>
       	       <option value="US">United States</option>
   	          	<option value="IN">India</option>
          	     <option value="UK">United Kingdom</option>
     	       </select>
	          )}

  	       <button type="submit" className="auth-btn">Create Account</button>
          </form>
     	</div>
	  </div>
  );
}

export default Register;
