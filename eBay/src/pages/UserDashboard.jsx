import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Adminnav from '../components/Adminnav';
import '../components/Adminnav.css';
import './AdminDashboard.css';
import { API_BASE_URL } from '../config/env';

function UserDashboard() {
   const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
   const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState(null);
	const [editProductData, setEditProductData] = useState(null);
  const [newEditImages, setNewEditImages] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

	useEffect(() => {
     const userStr = localStorage.getItem('user');
  	if (!userStr) {
        navigate('/login');
     	return;
	  }

   	const user = JSON.parse(userStr);
     if (user.role === 'admin') {
     	navigate('/admin', { replace: true });
	     return;
     }

	  setCurrentUser(user);

     fetchProducts(user.name);
  }, [navigate]);


   const handleSignOut = () => {
     localStorage.removeItem('user');
     localStorage.removeItem('token');
	   navigate('/login');
   };

   const fetchProducts = async (sellerName) => {
     try {
	     const response = await fetch(`${API_BASE_URL}/api/products`);
       const data = await response.json();
   	   const myProducts = data.filter((product) => product.seller === sellerName);
       setProducts(myProducts);
     } catch (error) {
	     console.error('Error fetching products:', error);
     }
  };

  const handleDelete = async (id) => {
	  const confirmDelete = window.confirm('Are you sure you want to delete this product?');
     if (!confirmDelete) return;

     try {
	    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
	        method: 'DELETE'
        });

        if (response.ok) {
     	   setProducts(products.filter((product) => product._id !== id));
	     }
     } catch (error) {
   	   console.error('Error deleting product:', error);
     }
   };

   const handleEditChange = (e) => {
  	const { name, value } = e.target;
     setEditProductData({ ...editProductData, [name]: value });
  };

  const handleSaveEdit = async (e) => {
   	e.preventDefault();
     try {
     	const formData = new FormData();
	     formData.append('title', editProductData.title);
        formData.append('price', editProductData.price);
  	  formData.append('quantity', editProductData.quantity);
        formData.append('description', editProductData.description);
     	formData.append('category', editProductData.category);

       if (newEditImages && newEditImages.length > 0) {
   	     for (let i = 0; i < newEditImages.length; i++) {
          	formData.append('newImages', newEditImages[i]);
     	  }
	     }

	  const response = await fetch(`${API_BASE_URL}/api/products/${editProductData._id}`, {
          method: 'PUT',
     	   body: formData
	     });

   	   if (response.ok) {
          const userStr = localStorage.getItem('user');
     	  const user = userStr ? JSON.parse(userStr) : null;
	        if (user) {
        	   fetchProducts(user.name);
  	     }
          setEditProductData(null);
     	   setNewEditImages([]);
	     }
     } catch (error) {
   	   console.error('Error updating product:', error);
     }
   };

   const filteredProducts = products.filter((product) =>
  	product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
   	<div className="admin-page-wrapper">
       <div className="admin-navbar">
     	  <Adminnav
	          searchQuery={searchQuery}
        	   setSearchQuery={setSearchQuery}
  	       activeTab={activeTab}
          	setActiveTab={setActiveTab}
			userRole={currentUser?.role || 'personal'}
	          productTabLabel="My Products"
       	/>
   	   </div>

     	<div className="admin-container">
	        <div className="admin-header-controls">
        	   <button className="signout-btn" onClick={handleSignOut}>Logout</button>
  	     </div>

     	   {activeTab === 'products' && (
	          <div className="table-wrapper">
       	     {filteredProducts.length === 0 ? (
   	          	<div className="empty-state">
          	        <p>No products available yet.</p>

	          	     <button className="save-btn" type="button" onClick={() => navigate('/sell')}>
        	          	Add Product
  	          	   </button>
          	     </div>
     	        ) : (
	          	   <table className="admin-table">
       	          <thead>
   	          	     <tr>
          	          	<th>Image</th>
     	          	     <th>Title</th>
	          	          <th>Price</th>
        	          	  <th>Quantity</th>
  	          	        <th>Actions</th>
          	          </tr>
     	          	</thead>
	          	     <tbody>
       	          	{filteredProducts.map((product) => (
   	          	       <tr key={product._id}>
          	          	  <td>
     	          	          <img
	          	          	     src={product.images && product.images.length > 0 ? product.images[0] : ''}
        	          	          alt="product"
  	          	          	  className="table-img"
          	          	     />
     	          	       </td>
	          	          	<td className="truncate-cell">{product.title}</td>
       	          	     <td>₹{product.price}</td>
   	          	          <td>{product.quantity}</td>
          	          	  <td className="actions-cell">

	          	          	   <button className="view-btn" onClick={() => setSelectedProduct(product)}>
        	          	          View
  	          	          	</button>
          	          	     <button className="edit-btn" onClick={() => setEditProductData(product)}>
     	          	          	Edit
	          	          	  </button>

   	          	          	<button className="delete-btn" onClick={() => handleDelete(product._id)}>
          	          	       Delete
     	          	          </button>
	          	          	</td>
        	          	  </tr>
  	          	     ))}
          	       </tbody>
     	          </table>
	          	)}
       	  </div>
   	     )}

     	  {selectedProduct && (
	          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
        	     <div className="modal-content" onClick={(e) => e.stopPropagation()}>
  	          	<div className="modal-header">
          	       <h3>Product Details</h3>
     	          </div>

       	       <div className="modal-body">
   	          	  <div className="modal-images-grid">
          	          {selectedProduct.images && selectedProduct.images.map((img, idx) => (
     	          	     <img key={idx} src={img} alt="product" className="modal-img" />
	          	       ))}
        	          </div>
  	          	   <div className="modal-detail-row">
          	          <span className="detail-label">Title:</span>
     	          	  <span className="detail-value">{selectedProduct.title}</span>
	          	     </div>
       	          <div className="modal-detail-row">
   	          	     <span className="detail-label">Price:</span>
          	          <span className="detail-value">₹{selectedProduct.price}</span>
     	          	</div>
	          	     <div className="modal-detail-row">
        	          	<span className="detail-label">Quantity:</span>
  	          	     <span className="detail-value">{selectedProduct.quantity}</span>
          	       </div>
     	          	<div className="modal-detail-row">
	          	        <span className="detail-label">Category:</span>
       	          	<span className="detail-value">{selectedProduct.category}</span>
   	          	  </div>

     	          	<div className="modal-detail-row description-row">
	          	       <span className="detail-label">Description:</span>
        	          	<p className="detail-value">{selectedProduct.description}</p>
  	          	   </div>
          	     </div>
     	          <div className="modal-footer">
	          	     <button className="close-btn" onClick={() => setSelectedProduct(null)}>Close</button>
       	       </div>
   	          </div>
          	</div>
     	  )}

        	{editProductData && (
  	       <div className="modal-overlay" onClick={() => { setEditProductData(null); setNewEditImages([]); }}>
          	  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
     	          <div className="modal-header">
	          	     <h3>Edit Product</h3>
       	       </div>
   	          	<form onSubmit={handleSaveEdit}>
          	        <div className="edit-form-group">
     	          	   <label>Title</label>
	          	       <input
        	          	  type="text"
  	          	        name="title"
          	          	value={editProductData.title}
     	          	     onChange={handleEditChange}
	          	          required
       	          	/>
   	          	  </div>
          	        <div className="edit-form-group">
     	          	   <label>Price</label>
	          	       <input
        	          	  type="number"
  	          	        name="price"
          	          	value={editProductData.price}
     	          	     onChange={handleEditChange}
	          	          required
       	          	/>
   	          	  </div>
          	        <div className="edit-form-group">
     	          	   <label>Quantity</label>
	          	       <input
        	          	  type="number"
  	          	        name="quantity"
          	          	value={editProductData.quantity}
     	          	     onChange={handleEditChange}
	          	          required
       	          	/>
   	          	  </div>
          	        <div className="edit-form-group">
     	          	   <label>Category</label>
	          	       <input
        	          	  type="text"
  	          	        name="category"
          	          	value={editProductData.category}
     	          	     onChange={handleEditChange}
	          	          required
       	          	/>
   	          	  </div>
          	        <div className="edit-form-group">
     	          	   <label>Description</label>
	          	       <textarea
        	          	  name="description"
  	          	        value={editProductData.description}
          	          	onChange={handleEditChange}
     	          	     required
	          	        />
       	          </div>

          	        <div className="edit-form-group">
     	          	   <label>Current Images</label>
	          	       <div className="modal-images-grid">
        	          	  {editProductData.images && editProductData.images.map((img, index) => (
  	          	          <img
          	          	     key={index}
     	          	          src={img}
	          	          	  alt="current product"
       	          	        className="modal-img"
   	          	          	style={{ width: '60px', height: '60px' }}
          	          	  />
     	          	     ))}
	          	       </div>
        	          </div>

          	       <div className="edit-form-group">
     	          	  <label>Upload New Images</label>
	          	        <input type="file" multiple onChange={(e) => setNewEditImages(e.target.files)} />
       	          </div>

          	        <div className="modal-footer">
     	          	   <button
	          	          type="button"
        	          	  className="cancel-btn"
  	          	        onClick={() => { setEditProductData(null); setNewEditImages([]); }}
          	          >
     	          	     Cancel
	          	        </button>
       	          	<button type="submit" className="save-btn">Save Changes</button>
   	          	  </div>
          	     </form>
     	       </div>
	          </div>
        	)}
  	  </div>
     </div>
  );
}

export default UserDashboard;
