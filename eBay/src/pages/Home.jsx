import React, { useEffect } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState([]);
  const categories = [
  "Saved", "Electronics", "Motors", "Fashion", "Collectibles and Art", 
   "Sports", "Health & Beauty", "Industrial equipment", "Home & Garden", "Deals", "Sell"
  ];

  useEffect(() => {
  fetch(`${API_BASE_URL}/api/products`)
  .then(res => res.json())
   .then(data => {setProducts(data); console.log("Products:", data)})
	.catch(err => console.error("Error fetching products:", err));
  }, []); 

  return (
  <div className="home-wrapper">
	<nav className="cat-nav">
     <ul>
   	{categories.map((cat) => (
       <li key={cat}>{cat}</li>
     ))}
	   </ul>
   </nav>

   <div className="content-container">
     <section className="hero blue-bg">
	  <div className="hero-content">
       <h1>All your faves are here</h1>
   	   <p>Refresh your space, elevate your style and power your work.</p>
     </div>
     </section>

     <section className="feature-bar">
  	<div>
        <h2>Shopping made easy</h2>
     	<p>Enjoy reliability, secure deliveries and hassle-free returns.</p>
	  </div>
     <button className="cta-black">Start now</button>
   	</section>

     <section className="products-section">
	     <h2>Featured Products</h2>
        <div className="products-grid">
  	  {products.length === 0 ? (
        <p>Loading products...</p>
     	) : (
	     products.map((product) => (
       	<div key={product._id} className="product-card" onClick={()=> navigate(`/product/${product._id}`)}>
   	     <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt={product.title} className="product-image"/>
          <h3>{product.title}</h3>
     	  <p>₹{product.price}</p>
	        <p className="seller">Seller: {product.seller}</p>
        	</div>
  	  ))
        )}
     	</div>
	  </section>

   	<section className="hero red-bg">
     <div className="hero-content">
     	<h1 className="white-text">Endless accessories.<br/>Epic prices.</h1>
	     <p className="white-text">Browse millions of upgrades for your ride.</p>
     </div>
  	</section>

     <section className="hero black-bg">
	  <div className="hero-content">
       <h1 className="white-text">Love yourself first</h1>
   	   <p className="white-text">This Valentine's Day, save on finds you'll actually love.</p>
     </div>
     </section>
	</div>
   </div>
  );
}

export default Home;
