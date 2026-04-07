import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE_URL } from '../config/env';

function Login() {
	const navigate = useNavigate();
   const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
	  const userStr = localStorage.getItem('user');
     if(userStr) {
   	   const user = JSON.parse(userStr);
       if(user.role === 'admin') {
     	  navigate('/admin');
	     } else {
        	navigate('/');
  	  }
     }
  }, [navigate]);

  const handleLogin = async (e) => {
   	e.preventDefault();

     try {
	     const response = await fetch(`${API_BASE_URL}/api/login`, {
        	method: 'POST',
  	     headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
     	});

       const data = await response.json();

       if (response.ok) {
     	  localStorage.setItem('token', data.token); 
	        localStorage.setItem('user', JSON.stringify(data.user));
                
  	     if (data.user.role === 'admin') {
          	navigate('/admin');
     	   } else {
	          navigate('/');
       	}
   	   } else {
          alert("Login Failed: " + data.message);
     	}
	   } catch (error) {
        console.error("Error", error);
  	  alert("Could not connect to server.");
     }
  };

  return (
   	<div className="auth-page">
       <main>
     	  <div className="info">To buy and sell on www.ebay.com or other eBay sites internationally, existing users can login using their credentials or new users can register an eBay account on ebay.in. Kindly note you can no longer buy or sell on eBay.in</div>
                
        	<form className="auth-form" onSubmit={handleLogin}>
  	       <h1>Sign in to your account</h1>
                    
     	     <input 
	          	type="text" 
       	     placeholder="Email" 
   	          onChange={(e) => setEmail(e.target.value)} 
          	   required 
     	     />
	          <input 
        	     type="password" 
  	          placeholder="Password" 
          	  onChange={(e) => setPassword(e.target.value)} 
     	        required 
	          />
                    
   	        <button type="submit" className="auth-btn">Sign in</button>
          </form>
                
	        <div className="divider"><span>or</span></div>
                 
  	     <div style={{textAlign: 'center', marginTop: '10px'}}>
          <Link to="/register" style={{color: '#0654ba'}}>Create an account</Link>
     	   </div>
	     </main>
     </div>
   );
}

export default Login;
