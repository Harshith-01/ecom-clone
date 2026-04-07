import React from 'react';
import {useState,useEffect } from 'react';
import './Product.css';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';

function Product() {
   const {id} = useParams();
    const navigate = useNavigate();
	const [product, setProduct] = useState(null);
	const [selectedQty, setSelectedQty] = useState(1);

   useEffect(() => {
	fetch(`${API_BASE_URL}/api/products/${id}`)
     	.then(res => {
	        if (!res.ok) throw new Error("Product not found");
        	return res.json();
  	  })
        .then(data => {
     	   setProduct(data);
	     })
       .catch(err => {
   	     console.error(err);
       });
   }, [id]);

   const handleWatchlist = async () => {
  	const userStr = localStorage.getItem('user');
     const userid = userStr ? JSON.parse(userStr).id : null;
     if (!userStr) {
	     alert("Please log in to add items to your watchlist.");
       navigate('/login');
   	   return;
     }
     const user = JSON.parse(userStr);
	   try{
		const response = await fetch(`${API_BASE_URL}/api/users/${userid}/watchlist`, {
  	  method: 'POST',
        headers:{ 'Content-Type': 'application/json' },
     	body: JSON.stringify({ productId: id })
	  });
     const data = await response.json();
   	if(response.ok) {
       alert("Product added to watchlist!");
     } else {
	     alert("Error: " + data.message);
     }
  } catch (error) {
     console.error("Error adding product to watchlist:", error);
     alert("An error occurred while adding the product to the watchlist.");
	}
  };

  const handleAddToCart = () => {
		const userStr = localStorage.getItem('user');
		if (!userStr) {
			alert("Please log in to add items to your cart.");
			navigate('/login');
			return;
		}

		if (!product) return;

		const user = JSON.parse(userStr);
		const cartKey = `cart_${user.id}`;
		let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];

		let found = false;
		for (let i = 0; i < cartData.length; i++) {
			if (cartData[i]._id === product._id) {
			const oldQty = Number(cartData[i].quantity) || 1;
			const addQty = Number(selectedQty) || 1;
			const maxQty = Number(product.quantity) || 1;
			cartData[i].quantity = Math.min(oldQty + addQty, maxQty);
			found = true;
			break;
			}
		}

		if (!found) {
			cartData.push({
			_id: product._id,
			title: product.title,
			price: Number(product.price) || 0,
			image: product.images && product.images.length > 0 ? product.images[0] : '',
			quantity: Number(selectedQty) || 1,
				maxQuantity: Number(product.quantity) || 1
			});
		}

		localStorage.setItem(cartKey, JSON.stringify(cartData));
		alert("Added to cart");

  };

		const handleBuyNow = () => {
			const userStr = localStorage.getItem('user');
			if (!userStr) {
				alert("Please log in to proceed with the purchase.");
				navigate('/login');
				return;
			}

			if (!product) return;

			navigate('/checkout', {
				state: {
					from: 'product',
					items: [
						{
							productId: product._id,
							title: product.title,
							price: Number(product.price) || 0,
							quantity: Number(selectedQty) || 1,
							image: product.images && product.images.length > 0 ? product.images[0] : ''
						}
					]
				}
			});
		};
  return (
  <div className="product-page-container">
     <div className="product-main">
            
        <div className="product-image-section">
  	     <div className="product-image-gallery">
          {product && product.images.map((img, idx) => (
     	          	     <img key={idx} src={img} alt="product" className="gallery-img" />
	          	        ))}
       	</div>
   	     <img src={product && product.images && product.images.length > 0 ? product.images[0] : ''} alt={product ? product.title : 'Product Image'} />
       </div> 
            
	     <div className="product-details-section">
        	<h1 className="product-title">{product ? product.title : 'Product Title'}</h1>
  	     <div className="product-seller">Sold by: <strong>{product ? product.seller : 'Seller Name'}</strong></div>
            
     	<div className="product-price-box">
	       <div className="price-label">Price:</div>
       	<div className="price-amount">₹{product ? product.price : '0.00'}</div>
   	   </div>
       <div className="product-shipping">
     	{/* <p><strong>Quantity Available:</strong> {product ? product.quantity : '0'}</p> */}
	     <p><strong>Quantity :</strong><input type="number" min="1" max={product ? product.quantity : 1} value={selectedQty} onChange={(e) => {
	      const v = Number(e.target.value) || 1;
	      const max = product ? Number(product.quantity) || 1 : 1;
	      if (v < 1) setSelectedQty(1);
	      else if (v > max) setSelectedQty(max);
	      else setSelectedQty(v);
	     }} className="quantity-input"/><strong> {product ? product.quantity : '0'} available </strong></p>
        	   </div>
  	  <div className="product-actions">
          {/* <input type="number" min="1" max={product ? product.quantity : 1} defaultValue="1" className="quantity-input"/> */}
     	   <button className="btn-buy-now" onClick={handleBuyNow}>Buy Now</button>
	       <button className="btn-add-cart" onClick={handleAddToCart}>Add to Cart</button>
       	<button className="btn-watchlist" onClick={handleWatchlist}>Add to Watchlist</button>
   	   </div>
       <div className="product-description">
     	  <h2>Description</h2>
	        <p>{product ? product.description : 'No description available.'}</p>
        </div>
  	  </div>
     </div>
  </div>
  );
}



export default Product;
