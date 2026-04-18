import React, { useState, useEffect } from "react";
import './OrdersManagement.css';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/env';
import Adminnav from '../components/Adminnav';
import './AdminDashboard.css';
function OrdersManagement() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [pendingStatus, setPendingStatus] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('orders');

useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        navigate('/login');
        return;
    }
    const parsedUser = JSON.parse(userStr);
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
        const visibleOrders = user.role === 'admin'
            ? data
            : user.role === 'business'
                ? data.filter((order) => order.products.some((p) => p.productId?.sellerId === user.id || p.productId?.seller === user.name))
                : data.filter((order) => order.buyerId?._id === user.id);
        setOrders(visibleOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('An error occurred while fetching your orders.');
    }
};


const handleStatusChange = async (orderId, newStatus) => {
    setPendingStatus(prev => ({ ...prev, [orderId]: newStatus }));
};


const handleSave=async(orderId)=>{
const newStatus = pendingStatus[orderId];
if(!newStatus) return;
try{
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: newStatus })
    });
if(response.ok){
    setOrders(orders.map(o=>o._id===orderId?{...o,deliveryStatus:newStatus}:o));
    setPendingStatus(prev => {const updated = { ...prev }; delete updated[orderId]; return updated; });
    alert("Order status updated successfully!");
    
}
} catch(error){
    console.error("Error updating order status:", error);
    alert("An error occurred while updating the order status.");

}
};

const handleDelete=async(orderId)=>{
    try{
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            method: 'DELETE'
        });
        if(!response.ok) throw new Error("Failed to delete order");
        setOrders(orders.filter(order=>order._id!==orderId));
        alert("Order deleted successfully!");
    } catch(error){
        console.error("Error deleting order:", error);
        alert("An error occurred while deleting the order.");

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
        String(order.buyerId?.email || '').toLowerCase().includes(query) ||
        productsText.includes(query)
    );
});

const canUpdateOrders = currentUser?.role === 'admin' || currentUser?.role === 'business';

return (
    <div className="admin-page-wrapper">
    <div className="admin-navbar">
        <Adminnav
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showUsersTab={currentUser?.role === 'admin'}
            userRole={currentUser?.role || 'personal'}
            productTabLabel={currentUser?.role === 'admin' ? 'Manage Products' : 'My Products'}
        />
    </div>
    <div className="admin-container">
    <div className="admin-header-controls">
        <button className="signout-btn" onClick={handleSignOut}>Logout</button>
    </div>
    <div className="table-wrapper">
    <div className="orders-container">
        <h1>Manage Orders</h1>
        {filteredOrders.length === 0 ? (
            <p>{currentUser?.role === 'admin' ? 'No orders yet.' : currentUser?.role === 'business' ? 'No orders for your listed products yet.' : 'No orders found.'}</p>
        ) : (
            <table className="orders-table">
                <thead>
                <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Products</th>
                <th>Total Price</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                <th>Date</th>
                <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order,index)=>
                    <tr key={order._id || index}>
                        <td>{order._id}</td>
                        <td>{order.buyerId ? order.buyerId.email : 'N/A'}</td>
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
                            {canUpdateOrders ? (
                                <select value={pendingStatus[order._id] || order.deliveryStatus} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            ) : (
                                order.deliveryStatus
                            )}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="actions-cell">
                            <button className="view-btn" onClick={()=>setSelectedOrder(order)}>View</button>
                            {canUpdateOrders && <button className="edit-btn" onClick={() => handleSave(order._id)} >Save</button>}
                            {canUpdateOrders && <button className="delete-btn" onClick={() => handleDelete(order._id)}>Delete</button>}
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        )}
    </div>
    </div>
              {selectedOrder && (
            <div className="modal" onClick={()=>setSelectedOrder(null)}>
                <div className="modal-content">
                    <div className="modal-order">
                    <h2>Order Details</h2>
                <p><strong>Product:</strong> {selectedOrder.products.map((p, index) => (
                    <span key={index}>{p.productId?.title} x{p.quantity}, </span>
                ))}</p>
                <p><strong>Total Price:</strong> ₹{selectedOrder.totalPrice}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
                <p><strong>Delivery Status:</strong> {selectedOrder.deliveryStatus}</p>
                    </div>
                    <div className="modal-shipping">
                <h2>Shipping Details</h2>
                <p><strong>Name:</strong> {selectedOrder.shippingDetails.fullName}</p>
                <p><strong>Mobile:</strong> {selectedOrder.shippingDetails.mobileNumber}</p>
                <p><strong>Email:</strong> {selectedOrder.shippingDetails.email}</p>
                <p><strong>Address:</strong> {selectedOrder.shippingDetails.addressLine}, {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state}, {selectedOrder.shippingDetails.pincode}, {selectedOrder.shippingDetails.country}</p>
                <button onClick={()=>setSelectedOrder(null)}>Close</button>
                </div>
                </div>
            </div>
        )}
    </div>
</div>
)
}


export default OrdersManagement;