import React from 'react';
import './Navbar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


function Navbar() {
  const [showMenu, setShowMenu] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showProfile, setShowProfile] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = React.useState('');
  React.useEffect(() => {
   const userStr = localStorage.getItem('user');
	if (userStr) {
   setCurrentUser(JSON.parse(userStr));
  } else {
   setCurrentUser(null);
  }
  const params = new URLSearchParams(location.search);
  setSearchQuery(params.get('search') || '');
  }, [location]);

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const handleSellClick = () => {
  const userStr = localStorage.getItem('user');
   if (!userStr) {
	navigate('/login');
   return;
  }
   const user = JSON.parse(userStr);
  if (user.role == 'admin') {
	navigate('/admin');
  }else {
   navigate('/dashboard');
  }
  };

  const handleLogout = () => {
  localStorage.removeItem('token');
   localStorage.removeItem('user');
  setCurrentUser(null);
	setShowProfile(false);
  navigate('/');
  };

  const handleWatchlistClick = () => {
	if (!currentUser) {
   alert("Please log in to view your watchlist.");
  navigate('/login');
   } else {
  navigate('/watchlist');
	} 
  };
  return (
  <header className="navbar">
   <div className="top-bar-container">
	   <div className="container top-bar">
     <div className="top-left">

        {currentUser ? (
     	<div className="profile-container">
	       <span className="profile-name" onClick={() => setShowProfile(!showProfile)}>
       	Hello, {currentUser.name}
   	     </span>
          {showProfile && (
     	  <div className="profile-dropdown">
	          <p className="profile-name2">{currentUser.name}</p>
        	   <p className="profile-email">{currentUser.email}</p>
  	       <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
     	   )}
	       </div>
       ) : (
   	   <span className="hi-user">Hi! <Link to="/login" className="blue-link">Sign in</Link> or <Link to="/register" className="blue-link">register</Link></span>
       )}
     	<a href="#">Daily Deals</a>
	     {/* <a className="top-link">Brand Outlet</a> */}
        <a className="top-link">Help & Contact</a>
  	</div>
     <div className="top-right">
     	{/* <a href="#">Sell</a> */}
	     <a className="sell-link" onClick={handleSellClick}>My eBay</a>
       <a className="watchlist-link" onClick={handleWatchlistClick}>Watchlist</a>
   	   {/* <div className="dropdown">My eBay</div> */}
       {/* <Link to="/admin" className="dropdown">Admin</Link> */}
     	<button className="icon-btn">
	     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
  	  <button className="icon-btn" onClick={() => navigate('/cart')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
     	</button>
	  </div>
     </div>
   </div>

   <div className="container header-main">
	   <Link to="/" className="logo">
     <span className="c-e">e</span><span className="c-b">b</span><span className="c-a">a</span><span className="c-y">y</span>
  	</Link>
        
     <div className="shop-btn-container" onMouseDown={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
	  <div className="shop-btn"> Shop by category </div>
     {showMenu && ( 
   	   <div className="mega-menu">
       <div className="menu-column">
     	  <h4>Motors</h4>
	        <ul>
        	<li><a href="#">Parts & Accessories</a></li>
  	     <li><a href="#">Cars & Trucks</a></li>
          <li><a href="#">Boats</a></li>
     	   <li><a href="#">Motorcycles</a></li>
	       <li><a href="#">Other Vehicles</a></li>
       	</ul>
   	</div>
       <div className="menu-column">
     	  <h4>Electronics</h4>
	        <ul>
        	<li><a href="#">Computers & Networking</a></li>
  	     <li><a href="#">Cell Phones, Smart Watches & Accessories</a></li>
          <li><a href="#">Video Games & Console</a></li>
     	   <li><a href="#">Cameras & Photo</a></li>
	       </ul>
       </div>  
   	   <div className="menu-column">
          <h4>Collectibles & Art</h4>
     	  <ul>
	        <li><a href="#">Trading Cards</a></li>
        	<li><a href="#">Collectibles</a></li>
  	     <li><a href="#">Art</a></li>
          <li><a href="#">Coins & Paper Money</a></li>
     	   <li><a href="#">Sports Mem, Cards & Fan Shop</a></li>
	       </ul>
       </div>
   	   <div className="menu-column">
          <h4>Clothing & Accessories</h4>
     	  <ul>
	        <li><a href="#">Women</a></li>
        	<li><a href="#">Men </a></li>
  	     <li><a href="#">Handbags</a></li>
          <li><a href="#">Collectible Sneakers</a></li>
     	   </ul>
	     </div>
       <div className="menu-column">
   	     <h4>Business & Industrial</h4> 
          <ul>
     	  <li><a href="#">Modular & Pre Fabricated Buildings</a></li>
	        <li><a href="#">Construction & Engineering</a></li>
        	<li><a href="#">Industrial Tools & Supplies</a></li>
  	     </ul>
        </div>
     	<div className="menu-column">
	       <h4>Home & Garden</h4>
       	<ul>
   	     <li><a href="#">Furniture</a></li>
          <li><a href="#">Home DÃ©cor</a></li>
     	  <li><a href="#">Kitchen, Dining & Bar</a></li>
	        <li><a href="#">Lawn & Garden</a></li>
        	<li><a href="#">Household Supplies</a></li>
  	     </ul>
        </div>
     	<div className="menu-column">
	       <h4>Jewelry & Watches</h4>
       	<ul>
   	     <li><a href="#">Fine Jewelry</a></li>
          <li><a href="#">Fashion Jewelry</a></li>
     	  <li><a href="#">Luxury Watches</a></li>
	        <li><a href="#">Other Jewelry & Watches</a></li>
        	</ul>
  	  </div>
        <div className="menu-column">
     	   <h4>Other Categories</h4>
	       <ul>
       	<li><a href="#">Books</a></li>
   	     <li><a href="#">Music</a></li>
          <li><a href="#">Movies & TV</a></li>
     	  <li><a href="#">Pet Supplies</a></li>
	        <li><a href="#">Baby</a></li>
        	<li><a href="#">Toys & Hobbies</a></li>
  	     <li><a href="#">Business & Industrial</a></li>
          </ul>
     	</div>
	     </div>
     )}
   	</div>

     <div className="search-wrapper">
	   <div className="search-input-group">
        <span className="search-icon">
  	     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
      	<input
          type="text"
          placeholder="Search for anything"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
	     <select className="cat-select">
       <option>All Categories</option>
   	   <option>Electronics</option>
       <option>Motors</option>
     	<option>Fashion</option>
      <option>Collectibles & Art</option>
      <option>Sports</option>
      <option>Health & Beauty</option>
      <option>Industrial Equipment</option>
      <option>Home & Garden</option>
	     </select>
     </div>
   	<button type="button" className="search-btn" onClick={handleSearch}>Search</button>
     </div>
        
	  
  </div>
   </header>
  )
}

export default Navbar;
