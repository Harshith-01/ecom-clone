import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Adminnav.css';

function Adminnav({
	 searchQuery,
	 setSearchQuery,
	 setActiveTab,
	 showUsersTab = false,
	 productTabLabel = 'Manage Products',
	 userRole = 'personal'
}) {
	const navigate = useNavigate();
	const isAdmin = userRole === 'admin';
	const canManageOrders = true;
	const canViewMyOrders = true;

	const goToProductsTab = () => {
		setActiveTab('products');
		navigate(isAdmin ? '/admin' : '/dashboard');
	};

	const goToUsersTab = () => {
		if (!isAdmin) {
			return;
		}
		setActiveTab('users');
		navigate('/admin');
	};

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
		 

	  <button onClick={goToProductsTab} className="product-btn">
          {productTabLabel}
     	</button>
	     {showUsersTab && isAdmin && (
	       	<button onClick={goToUsersTab} className="user-btn">
   	        Manage Users
          </button>
		  
     	)}
		{canManageOrders && <button className="orders-btn">
	 	  <Link to="/orders" className="orders-link">Manage Orders</Link>
	     </button>}
		 {canViewMyOrders && <button className="my-orders-btn">
	 	  <Link to="/my-orders" className="my-orders-link">My Orders</Link>
	     </button>}
	   </div>
	   
   </nav>
);
}
export default Adminnav;
