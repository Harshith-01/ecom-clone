import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Adminnav from '../components/Adminnav';
import '../components/Adminnav.css';
import './AdminDashboard.css';
import { API_BASE_URL } from '../config/env';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
   const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
	const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
   const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
   const [editProductData, setEditProductData] = useState(null);
	const [newEditImages, setNewEditImages] = useState([]);
    
  const [stats, setStats] = useState({
     totalProducts: 0,
     totalSellers: 0,
	  totalValue: 0
  });

  useEffect(() => {
     const userStr = localStorage.getItem('user');
	   if (!userStr) {
        navigate('/login');
  	  return;
     }
     const user = JSON.parse(userStr);
	  if (user.role !== 'admin') {
       navigate('/dashboard', { replace: true });
   	   return;
     }
     fetchProducts();
	   fetchUsers();
   }, [navigate]);

   const handleSignOut = () => {
     localStorage.removeItem('user');
	  localStorage.removeItem('token');
     navigate('/login');
   };

   const fetchUsers = async () => {
	   try {
		const response = await fetch(`${API_BASE_URL}/api/users`);
  	  const data = await response.json();
        setUsers(data);
     } catch (error) {
	     console.error("Error fetching users:", error);
     }
   };

   const fetchProducts = async () => {
	   try {
		const response = await fetch(`${API_BASE_URL}/api/products`);
  	  const data = await response.json();
        setProducts(data);
     	const totalProducts = data.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
	     const totalSellers = new Set(data.map(p => p.seller)).size;
       const totalValue = data.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2);
   	   setStats({ totalProducts, totalSellers, totalValue });
     } catch (error) {
     	console.error("Error fetching products:", error);
	   }
   };

   const handleDelete = async (id) => {
     const confirmDelete = window.confirm("Are you sure you want to delete this product?");
	  if (!confirmDelete) return;

   	try {
	const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
     	  method: 'DELETE',
	     });

  	  if (response.ok) {
          setProducts(products.filter((product) => product._id !== id));
     	} 
	  } catch (error) {
       console.error("Error deleting:", error);
   	}
  };

	const handleDeleteUser =async (id) => {
     const confirmDelete =window.confirm("Are you sure you want to delete this user?");
  	if(!confirmDelete) return;
     try {
	    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
	       method: 'DELETE',
       });
   	   if (response.ok) {
          setUsers(users.filter((user) => user._id !== id));
     	} else {
	        alert("Failed to delete user. Please try again.");
        }
  	}
     catch (error) {
     	console.error("Error deleting user:", error);
	  }
  }

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
       	fetchProducts();
   	     setEditProductData(null);
          setNewEditImages([]);
     	}
	   } catch (error) {
        console.error("Error updating product:", error);
  	}
   };

	const filteredProducts = products.filter((product) =>
     product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
   	product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
     product.seller.toLowerCase().includes(searchQuery.toLowerCase()) 
        
	);

  const filteredUsers = users.filter((user) => {
     const disName = user.role === 'business' ? user.businessName : `${user.firstName || 'N/A'} ${user.lastName || ''}`;
     return(
	     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       disName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   	   user.role.toLowerCase().includes(searchQuery.toLowerCase())
     )
   });

   return (
  	<div className="admin-page-wrapper"> 
        <div className="admin-navbar">
     	   <Adminnav 
	          searchQuery={searchQuery}
       	  setSearchQuery={setSearchQuery}
   	        activeTab={activeTab}
          	setActiveTab={setActiveTab}
     	  />
	     </div>
        <div className="admin-container">
  	     <div className="admin-header-controls">
          	<button className="signout-btn" onClick={handleSignOut}>Logout</button>
     	   </div>

       	<div className="admin-stats">
   	        <div className="stat-card">
          	   <div className="stat-item">
     	          <h3>Total Products</h3>
	          	  <p>{stats.totalProducts}</p>
        	     </div>
  	          <div className="stat-item">
          	     <h3>Total Sellers</h3>
     	          <p>{stats.totalSellers}</p>
	          	</div>
       	     <div className="stat-item">
   	          	<h3>Total Value</h3>
          	     <p>₹{stats.totalValue}</p>
     	       </div>
	          </div>
        	</div>

          {activeTab === 'products' && (
     	   <div className="table-wrapper">
	          {filteredProducts.length === 0 ? (
       	     <p className="empty-state">No products available to manage.</p>
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
  	          	          <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt="product" className="table-img" />
          	          	</td>
     	          	     <td className="truncate-cell">{product.title}</td>
	          	          <td>₹{product.price}</td>
       	          	   <td>{product.quantity}</td>
   	          	       <td className="actions-cell">
          	          	  <button 
     	          	          className="view-btn"
	          	          	   onClick={() => setSelectedProduct(product)}>
        	          	       View
  	          	          </button>
          	          	   <button 
     	          	          className="edit-btn"
	          	          	  onClick={() => setEditProductData(product)}>
       	          	        Edit
   	          	          </button>
          	          	  <button 
     	          	          className="delete-btn" 
	          	          	   onClick={() => handleDelete(product._id)}>
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

  	     {activeTab === 'users' && (
          	<div className="table-wrapper">
     	        {filteredUsers.length === 0 ? (
	          	   <p className="empty-state">No users found.</p>
       	     ) : (
   	          	<table className="admin-table">
          	        <thead>
     	          	   <tr>
	          	          <th>Email</th>
        	          	  <th>Name</th>
  	          	        <th>Role</th>
          	          	<th>Action</th>
     	          	  </tr>
	          	     </thead>
       	          <tbody>
   	          	     {filteredUsers.map((user) => (
          	          	<tr key={user._id}>
     	          	        <td className="truncate-cell">{user.email}</td>
	          	          	<td className="truncate-cell">{user.role === 'business' ? user.businessName : `${user.firstName || 'N/A'} ${user.lastName || ''}`}</td>
        	          	     <td>{user.role}</td>
  	          	          <td className="actions-cell">
          	          	     <button 
     	          	          className="view-btn"
	          	          	  onClick={() => setSelectedUser(user)}>
       	          	        View
   	          	          </button>
          	          	     <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>
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
  	          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
          	        <div className="modal-detail-row">
     	          	   <span className="detail-label">Seller:</span> 
	          	       <span className="detail-value">{selectedProduct.seller}</span>
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

     	   {selectedUser && (
	          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
       	     <div className="modal-content" onClick={e => e.stopPropagation()}>
   	          	<div className="modal-header">
          	        <h3>User Details</h3>
     	          </div>
	          	  <div className="modal-body">
        	          <div className="modal-detail-row">
  	          	     <span className="detail-label">Name:</span> 
          	          <span className="detail-value">{selectedUser.firstName} {selectedUser.lastName}</span>
     	          	</div>
	          	     <div className="modal-detail-row">
       	          	<span className="detail-label">Email:</span> 
   	          	     <span className="detail-value">{selectedUser.email}</span>
          	        </div>
     	          	<div className="modal-detail-row">
	          	       <span className="detail-label">Role:</span> 
        	          	<span className="detail-value">{selectedUser.role}</span>
  	          	   </div>
          	       {selectedUser.businessName && (
     	          	  <>
	          	          <div className="modal-detail-row">
       	          	     <span className="detail-label">Business Name:</span> 
   	          	          <span className="detail-value">{selectedUser.businessName}</span>
          	          	</div>
     	          	     <div className="modal-detail-row">
	          	          	<span className="detail-label">Business Location:</span> 
        	          	     <span className="detail-value">{selectedUser.businessLocation}</span>
  	          	        </div>
          	          </>
     	          	)}
	          	   </div>
       	       <div className="modal-footer">
   	          	  <button className="close-btn" onClick={() => setSelectedUser(null)}>Close</button>
          	     </div>
     	       </div>
	          </div>
        	)}

          {editProductData && (
     	     <div className="modal-overlay" onClick={() => {setEditProductData(null); setNewEditImages([]);}}>
	          	<div className="modal-content" onClick={e => e.stopPropagation()}>
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
	          	          <img key={index} src={img} alt="current product" className="modal-img" style={{ width: '60px', height: '60px' }} />
       	          	   ))}
   	          	       </div>
          	        </div>

	          	     <div className="edit-form-group">
        	          	<label>Upload New Images</label>
  	          	        <input type="file" multiple onChange={(e) => setNewEditImages(e.target.files)} />
          	       </div>

	          	     <div className="modal-footer">
       	          	<button type="button" className="cancel-btn" onClick={() => {setEditProductData(null); setNewEditImages([]);}}>Cancel</button>
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

export default AdminDashboard;
