import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import './Watchlist.css';
import { API_BASE_URL } from '../config/env';
function Wishlist() {
  const [watchlist, setWatchlist] = useState([]);
   const navigate = useNavigate();
  useEffect(() => {
	  const userStr = localStorage.getItem('user');
     const userid = userStr ? JSON.parse(userStr).id : null;
   	if (!userStr) {
       navigate('/login');
     	return;
	   }
     const user = JSON.parse(userStr);
    fetch(`${API_BASE_URL}/api/users/${userid}/watchlist`)
        .then( res=> res.json())
     	.then( data => {
	       setWatchlist(data.watchlist || []);
       })
   	   .catch( err => {
          console.error("Error fetching watchlist:", err);
     	});
	}, [navigate]);

  const handleRemoveFromWatchlist = (productId) => {
   const userStr = localStorage.getItem('user');
  const userid = userStr ? JSON.parse(userStr).id : null;
	if (!userStr) {
     navigate('/login');
   	return;
  }
  fetch(`${API_BASE_URL}/api/users/${userid}/watchlist/${productId}`, {
	   method: 'DELETE'
   })
  .then(res => res.json())
   .then(data => {
     if (data.message === "Product removed from watchlist") {
	     setWatchlist(prevWatchlist => prevWatchlist.filter(item => item._id !== productId));
     }
   })
  .catch(err => {
     console.error("Error removing product from watchlist:", err);
	});
   };

   return (
     // <div>
	  //     {watchlist.length === 0 ? (
     //         <p>Your watchlist is empty.</p>
   	//     ) : (
     //         watchlist.map(item => (
     //             // <div key={item._id}>
	   //             //     <h3>{item.title}</h3>
     //             //     <p>${item.price}</p>
  	//             // </div>
                    
     //         ))
	  //     )}
     // </div>
   	     <section className="watchlist-section">
       <h2>Watchlist</h2>
     	<div className="watchlist-grid">
	     {watchlist.length === 0 ? (
        <p>Your watchlist is empty.</p>
  	  ) : (
        watchlist.map((product) => (
     	   <div key={product._id} className="watchlist-card" onClick={()=> navigate(`/product/${product._id}`)}>
         <img src={product.images && product.images.length > 0 ? `${API_BASE_URL}${product.images[0]}` : ''} alt={product.title} className="product-image"/>
       	<h3>{product.title}</h3>
   	     <p>₹{product.price}</p>
          <button className="remove-button" onClick={(e) => { e.stopPropagation(); handleRemoveFromWatchlist(product._id); }}>Remove</button>
     	  </div>
	     ))
        )}
  	  </div>
     </section>
  );
 }

 export default Wishlist;
