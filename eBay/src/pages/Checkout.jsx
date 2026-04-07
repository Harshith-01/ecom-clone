import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.css';
import { API_BASE_URL, RAZORPAY_KEY_ID } from '../config/env';

function Checkout() {
   const location = useLocation();
   const navigate = useNavigate();
   const items = location.state && location.state.items ? location.state.items : [];
   const from = location.state && location.state.from ? location.state.from : 'product';
   const [loading, setLoading] = useState(false);

   const [fullName, setFullName] = useState('');
   const [mobileNumber, setMobileNumber] = useState('');
   const [email, setEmail] = useState('');
   const [addressLine, setAddressLine] = useState('');
   const [city, setCity] = useState('');
   const [stateName, setStateName] = useState('');
   const [pincode, setPincode] = useState('');
   const [country, setCountry] = useState('India');
const razorpayKey = RAZORPAY_KEY_ID;
   useEffect(() => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
         navigate('/login');
         return;
      }

      const user = JSON.parse(userStr);
      setEmail(user.email || '');

      if (!items.length) {
         navigate('/cart');
      }
   }, [navigate, items]);

   let subtotal = 0;
   for (let i = 0; i < items.length; i += 1) {
      const itemPrice = Number(items[i].price) || 0;
      const itemQuantity = Number(items[i].quantity) || 1;
      subtotal += itemPrice * itemQuantity;
   }

   // const deliveryCharge = subtotal > 0 ? 40 : 0;
   const finalTotal = subtotal ; //+ deliveryCharge;

   const handlePlaceOrder = async (e) => {
      e.preventDefault();
      const userStr = localStorage.getItem('user');
      if (!userStr) {
         navigate('/login');
         return;
      }

      const user = JSON.parse(userStr);
      const products = [];
      for (let i = 0; i < items.length; i += 1) {
         products.push({
            productId: items[i].productId,
            quantity: Number(items[i].quantity) || 1,
            price: Number(items[i].price) || 0
         });
      }

      const orderData = {
         buyerId: user.id,
         products: products,
         totalPrice: finalTotal,
         shippingDetails: {
            fullName: fullName,
            mobileNumber: mobileNumber,
            email: email,
            addressLine: addressLine,
            city: city,
            state: stateName,
            pincode: pincode,
            country: country
         }
      };

      try {
         setLoading(true);
         const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
         });
         const data = await response.json();

         if (!response.ok) {
            alert(data.message || 'Could not place order');
            return;
         }

         if(!window.Razorpay){
            alert("Razorpay SDK not found. Please check your connection.");
            return;
         }
         const dbOrderId=data.newOrder && data.newOrder._id ? data.newOrder._id : null;
const razorpayOrderId=data.razorpayOrderId;

const options={
   key: razorpayKey,
   amount:Math.round(finalTotal*100),
   currency:'INR',
   name:'eBay Clone',
   description:'Test Transaction',
   order_id: razorpayOrderId,
   prefill:{
      name:fullName,
      email:email,
      contact:mobileNumber
   },
   handler: async function(response){
      try{
         const verifyResponse = await fetch(`${API_BASE_URL}/api/orders/verify`, {
            method:'POST',
            headers:{ 'Content-Type': 'application/json' },
            body: JSON.stringify({
               razorpayPaymentId: response.razorpay_payment_id,
               razorpayOrderId: response.razorpay_order_id,
               razorpaySignature: response.razorpay_signature,
               dbOrderId: dbOrderId
            })
         });

         const verifyData = await verifyResponse.json();

         if(!verifyResponse.ok){
            alert(verifyData.message || 'Payment verification failed');
            return;
         }

         if (from === 'cart') {
            const cartKey = `cart_${user.id}`;
            localStorage.removeItem(cartKey);
         }

         alert('Payment successful and Order placed successfully');
         navigate('/orders');
      }
      
catch(verifyError){
         console.error("Error verifying payment:", verifyError);
         alert("An error occurred while verifying the payment.");
      }
   },
   modal:{
      ondismiss:function(){
         alert("Payment process was cancelled.");
      }
   },
   theme:{
      color:'#f5af02'
   }
};
const razorpayObject=new window.Razorpay(options);
razorpayObject.open();
      }catch(error){
         console.error("Error placing order:", error);
         alert("An error occurred while placing your order. Please try again.");
      }finally{
         setLoading(false);
      }
   };

   

   return (
      <div className="checkout-page">
         <div className="checkout-container">
            <h1>Checkout</h1>
            <form className="checkout-form" onSubmit={handlePlaceOrder}>
               <h2>Shipping Details</h2>
               <label htmlFor="fullName">Full name</label>
               <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
               <label htmlFor="mobileNumber">Mobile number</label>
               <input id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
               <label htmlFor="email">Email</label>
               <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
               <label htmlFor="addressLine">Address line</label>
               <input id="addressLine" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
               <div className="row-two">
               <div>
                     <label htmlFor="city">City</label>
                     <input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div>
                     <label htmlFor="state">State</label>
                     <input id="state" value={stateName} onChange={(e) => setStateName(e.target.value)} required />
                  </div>
               </div>
               <div className="row-two">
               <div>
               <label htmlFor="pincode">Pincode</label>
                  <input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                  </div>
                  <div>
                  <label htmlFor="country">Country</label>
                  <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                  </div>
               </div>

               <button className="place-order-btn" type="submit" disabled={loading}>
                  {loading ? 'Placing...' : 'Buy Now'}
               </button>
            </form>
         </div>
      </div>
   );
}

export default Checkout;
