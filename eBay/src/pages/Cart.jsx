import React, {useState, useEffect} from "react";
import './Cart.css';
import { useNavigate } from "react-router-dom";
function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

        useEffect(() => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);
            const cartKey = `cart_${user.id}`;
            const cartData = JSON.parse(localStorage.getItem(cartKey)) || [];
            setCartItems(cartData);
        }, [navigate]);

        const handleRemove = (productId) => {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;

            const user = JSON.parse(userStr);
            const cartKey = `cart_${user.id}`;

            const updated = cartItems.filter((item) => item._id !== productId);
            setCartItems(updated);
            localStorage.setItem(cartKey, JSON.stringify(updated));
        };

        const handleQtyChange = (productId, newQty, maxQty) => {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;

            const user = JSON.parse(userStr);
            const cartKey = `cart_${user.id}`;

            const qty = Number(newQty) || 1;
            const max = Number(maxQty) || 1;
            let finalQty = qty;

            if (qty < 1) finalQty = 1;
            if (qty > max) finalQty = max;

            const updated = cartItems.map((item) => {
                if (item._id === productId) {
                    return { ...item, quantity: finalQty };
                }
                return item;
            });

            setCartItems(updated);
            localStorage.setItem(cartKey, JSON.stringify(updated));
        };

        const handleBuyNow = () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
            alert("Please log in to proceed with the purchase.");
            navigate('/login');
            return;
            }

            if (cartItems.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            navigate('/checkout', {
                state: {
                    from: 'cart',
                    items: cartItems.map(item => ({
                        productId: item._id,
                        title: item.title,
                        price: Number(item.price) || 0,
                        quantity: Number(item.quantity) || 1,
                        image: item.image || ''
                    }))
                }
            });
        };


        const totalPrice = cartItems.reduce((sum, item) => {
            return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1));
        }, 0);

 return(
    <div className="cart-container">
        <h1>Your Cart</h1>
        <div className="table-wrapper">
<table className="cart-table">
            <thead>
                <tr> 
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
            <th>Subtotal</th>
            </tr>
            </thead>
            <tbody>
                        {cartItems.length === 0 ? (
                            <tr>
                                <td colSpan="6">Your cart is empty.</td>
                            </tr>
                        ) : (
                            cartItems.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <img src={item.image || ''} alt={item.title} className="table-img" />
                                    </td>
                                    <td>{item.title}</td>
                                    <td>₹{Number(item.price).toFixed(2)}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.maxQuantity || 1}
                                            value={item.quantity}
                                            onChange={(e) => handleQtyChange(item._id, e.target.value, item.maxQuantity)}
                                        />
                                    </td>
                                    <td className="actions-cell">
                                        <button className="view-btn" onClick={() => navigate(`/product/${item._id}`)}>View</button>
                                        <button className="delete-btn" onClick={() => handleRemove(item._id)}>Remove</button>
                                    </td>
                                    <td>₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
            </tbody>
        </table>
            </div>
        <div className="cart-summary">
                        <h2>Total: ₹{totalPrice.toFixed(2)}</h2>
            <button className="buy-btn" onClick={handleBuyNow}>Buy Now</button>
        </div>
    </div>
 );
}
export default Cart;