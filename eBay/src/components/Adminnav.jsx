import React from 'react';
import { Link } from 'react-router-dom';
import './Adminnav.css';

function Adminnav({ searchQuery, setSearchQuery, activeTab, setActiveTab, showUsersTab = true, productTabLabel = 'Manage Products' }) {
   return (
  <nav className="admin-nav">
	  <div className="admin-nav-left">
       <Link to="/" className="logo">
   	        <span className="c-e">e</span><span className="c-b">b</span><span className="c-a">a</span><span className="c-y">y</span>
       </Link>
     	<input
	        type="text"
        	placeholder="Search ..."
  	     value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
     	   className="search-input"
	     />
     </div>
   	<div className="admin-nav-right">
       <button className="sell-btn">
     	  <Link to="/sell" className="sell-link">List New Product</Link>
	     </button>
		 

  	  <button onClick={() => setActiveTab('products')} className="product-btn">
          {productTabLabel}
     	</button>
	     {showUsersTab && (
       	<button onClick={() => setActiveTab('users')} className="user-btn">
   	        Manage Users
          </button>
     	)}
		<button className="orders-btn">
	 	  <Link to="/orders" className="orders-link">Manage Orders</Link>
	     </button>
	   </div>
   </nav>
);
}
export default Adminnav;
