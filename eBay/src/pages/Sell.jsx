import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sell.css';
import { API_BASE_URL } from '../config/env';

function Sell() {
   const navigate = useNavigate();

   const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
   const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
	const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const userStr = localStorage.getItem('user');
   const user = userStr ? JSON.parse(userStr) : null;

   const handleSubmit = async (e) => {
  	e.preventDefault();
    
     if (!user) {
	     alert("Session expired. Please log in.");
       navigate('/login');
   	   return;
     }

	   const formData = new FormData();
     formData.append('title', title);
  	formData.append('price', price);
     formData.append('description', description);
     formData.append('category', category);
	  formData.append('quantity', quantity);
     formData.append('seller', user.name);
	  formData.append('sellerId', user.id);

     for (let i = 0; i < images.length; i++) {
     	formData.append('productImages', images[i]);
	   }

  	try {
		const response = await fetch(`${API_BASE_URL}/api/products`, {
     	   method: 'POST',
	       body: formData
       });
		const data = await response.json();

       if (response.ok) {
     	  if (user.role === 'admin') {
	          navigate('/admin');
        	} else {
  	       navigate('/dashboard');
          }
     	} else {
	       alert(data.message || 'Failed to list product. Please try again.');
       }
   	} catch(error) {
       console.error('Error submitting product:', error);
     }
	};

  return (
     <div className="sell-page">
     	<h1>List a Product</h1>
            
       <form onSubmit={handleSubmit} className="sell-form">
   	     <div className="form-group">
          	<label>Title</label>
     	     <input type="text" placeholder="Product title" required value={title} onChange={(e) => setTitle(e.target.value)} />
	        </div>
		  <div className="sell-row">
	       	<div className="form-group">
	 	      <label>Price</label>
	         	<input type="number" placeholder="Product price" required value={price} onChange={(e) => setPrice(e.target.value)} />
	    	   </div>
	       <div className="form-group">
	      	  <label>Quantity</label>
	   	        <input type="number" placeholder="Quantity" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
		  </div>
     	  <div className="form-group">
	          <label>Description</label>
        	   <textarea placeholder="Product description" required value={description} onChange={(e) => setDescription(e.target.value)} />
  	     </div>
		  <div className="sell-row">
          <div className="form-group">
	     	 <label>Category</label>
	          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
	       	 <option value="">Select a category</option>
	   	      <option value="electronics">Electronics</option>
	         	   <option value="fashion">Fashion</option>
	    	       <option value="home">Home & Garden</option>
	          	<option value="sports">Sports & Outdoors</option>
	        	   </select>
	     </div>
          <div className="form-group">
     	     <label>Product Images</label>
	          <input type="file" multiple required onChange={(e) => setImages(e.target.files)} />
       	</div>
		  </div>
   	     <button className="sell-button" type="submit">List Product</button>
          <button className="back-button" type="button" onClick={() => navigate(-1)}>Back</button>
     	</form>
	   </div>
   );
}

export default Sell;
