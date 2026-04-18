import React, { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';

const bannerImages = [
  'https://res.cloudinary.com/dputohust/image/upload/v1776050935/pexels-omotayo-samuel-329103165-16350687_bt703z.jpg',
  'https://res.cloudinary.com/dputohust/image/upload/v1776050934/pexels-toni-8968349_nktqz5.jpg',
  'https://res.cloudinary.com/dputohust/image/upload/v1776050934/pexels-paduret-6598819_vvqspa.jpg',
  'https://res.cloudinary.com/dputohust/image/upload/v1776050934/pexels-matreding-11297769_kgutsk.jpg',
  'https://res.cloudinary.com/dputohust/image/upload/v1776050934/pexels-cup-of-couple-6956903_vtpbhq.jpg'
];

function Home() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const searchTerm = new URLSearchParams(location.search).get('search') || '';
  const isSearch = Boolean(searchTerm);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);
 
  const filteredProducts = isSearch
    ? products.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-wrapper">
      {!isSearch && (
        <nav className="cat-nav">
          <ul>
            <li>Electronics</li>
            <li>Motors</li>
            <li>Fashion</li>
            <li>Collectibles and Art</li>
            <li>Sports</li>
            <li>Health & Beauty</li>
            <li>Industrial Equipment</li>
            <li>Home & Garden</li>
            <li onClick={()=>navigate("/sell")}>Sell</li>
          </ul>
        </nav>
      )}

      <div className="content-container">
        {isSearch ? (
          <>
            <section className="search-results-section">
              <div className="search-results-header">
                <h1>Search results for "{searchTerm}"</h1>
                <button className="clear-search" onClick={() => navigate('/')}>Clear search</button>
              </div>
            </section>
            <section className="products-section">
              <h2>Search Results</h2>
              <div className="products-grid">
                {filteredProducts.length === 0 ? (
                  <p>No products found for "{searchTerm}".</p>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product._id} className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
                      <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt={product.title} className="product-image" />
                      <h3>{product.title}</h3>
                      <p>₹{product.price}</p>
                      <p className="seller">Seller: {product.seller}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="carousel-section">
              <img src={bannerImages[activeSlide]} alt="Featured slide" className="carousel-image" />
              <div className="carousel-overlay">
                <div>
                  <h1>Discover deals that speak to you</h1>
                  <p>Find the right picks, fast. Fresh arrivals, top brands, and bold styles.</p>
                </div>
              </div>
              <button className="carousel-arrow left" onClick={() => setActiveSlide((activeSlide + bannerImages.length - 1) % bannerImages.length)}>
                ‹
              </button>
              <button className="carousel-arrow right" onClick={() => setActiveSlide((activeSlide + 1) % bannerImages.length)}>
                ›
              </button>
              <div className="carousel-controls">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${index === activeSlide ? 'active' : ''}`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </section>
                {!userStr && (
            <section className="feature-bar">
              <div>
                <h2>Shopping made easy</h2>
                <p>Enjoy reliability, secure deliveries and hassle-free returns.</p>
              </div>
              <button className="cta-black" onClick={()=>navigate("/login")}>Start now</button>
            </section>)}

            <section className="products-section">
              <h2>Featured Products</h2>
              <div className="products-grid">
                {products.length === 0 ? (
                  <p>Loading products...</p>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
                      <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt={product.title} className="product-image" />
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
                <h1 className="white-text">Endless accessories.<br />Epic prices.</h1>
                <p className="white-text">Browse millions of upgrades for your ride.</p>
              </div>
            </section>

            <section className="hero black-bg">
              <div className="hero-content">
                <h1 className="white-text">Love yourself first</h1>
                <p className="white-text">This Valentine's Day, save on finds you'll actually love.</p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
