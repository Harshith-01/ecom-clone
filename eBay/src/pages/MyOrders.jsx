import React, { useState, useEffect } from "react";
import './MyOrders.css';

import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/env';
import Adminnav from '../components/Adminnav';
import './AdminDashboard.css';
function MyOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('my-orders');
useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        navigate('/login');
        return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role === 'admin') {
        navigate('/orders', { replace: true });
        return;
    }
    setCurrentUser(parsedUser);
    fetchOrders();
}, [navigate]);

const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
};

const fetchOrders = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        const userid = user.id;
        const visibleOrders =  data.filter((order) =>order.buyerId?._id === userid);
        setOrders(visibleOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('An error occurred while fetching your orders.');
    }
};

const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
        return true;
    }

    const productsText = order.products
        .map((p) => p.productId?.title || '')
        .join(' ')
        .toLowerCase();

    return (
        String(order._id).toLowerCase().includes(query) ||
        String(order.paymentStatus || '').toLowerCase().includes(query) ||
        String(order.deliveryStatus || '').toLowerCase().includes(query) ||
        productsText.includes(query)
    );
});

return (
    <div className="admin-page-wrapper">
    <div className="admin-navbar">
        <Adminnav
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showUsersTab={false}
            userRole={currentUser?.role || 'personal'}
            productTabLabel="My Products"
        />
    </div>
    <div className="admin-container">
    <div className="admin-header-controls">
        <button className="signout-btn" onClick={handleSignOut}>Logout</button>
    </div>
    <div className="table-wrapper">
    <div className="orders-container">
        <h1>My Orders</h1>
        {filteredOrders.length === 0 ? (
            <p>No orders continue shopping.</p>
        ) : (
            <table className="orders-table">
                <thead>
                <tr>
                <th>Order ID</th>
                <th>Image</th>
                <th>Products</th>
                <th>Total Price</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order,index)=>
                    <tr key={order._id || index}>
                        <td>{order._id}</td>
                        <td>
                                {order.products.map((p,pIndex)=>(
                                    <div key={p.productId?._id||pIndex}>
                                        {p.productId?.images && p.productId.images.length > 0 ? (
                                            <img src={p.productId.images[0]} alt="product" className="table-img" />
                                        ) : (
                                            <div className="no-image">No Image</div>
                                        )}

                                    </div>
                                ))}
                        </td>
                        <td>
                            {order.products.map((p,pIndex)=>(
                                <div key={p.productId?._id || pIndex}>
                                    {p.productId?.title} - {p.quantity} x ₹{p.price}
                                </div>
                            ))}
                        </td>
                        <td>₹{order.totalPrice}</td>
                        <td>{order.paymentStatus}</td>
                        <td className="status-cell">
                            {order.deliveryStatus}
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        )}
    </div>
    </div>
</div>
 </div>
)
}


export default MyOrders;