import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer'; 
import './App.css'; 
import Sell from './pages/Sell';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Product from './pages/Product';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import OrdersManagement from './pages/OrdersManagement';
import Checkout from './pages/Checkout';
function Layout() {
  const location = useLocation();
  const isComponentsPage = ['/admin', '/dashboard', '/sell'].includes(location.pathname);
  // const isAdminDashboard = location.pathname === '/admin';
  // const isSellPage = location.pathname === '/sell';
  return (
   <div className="app">

	{(!isComponentsPage) && <Navbar />}

   <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/login" element={<Login />} />
	   <Route path="/register" element={<Register />} />
     <Route path="/sell" element={<Sell />} />
  	<Route path="/admin" element={<AdminDashboard />} />
     <Route path="/dashboard" element={<UserDashboard />} />
     <Route path="/product/:id" element={<Product />} />
	  <Route path="/watchlist" element={<Wishlist />} />
     <Route path="/cart" element={<Cart />} />
     <Route path="/orders" element={<OrdersManagement />} />
      <Route path="/checkout" element={<Checkout />} />
  </Routes>

  {/* <Sell /> */}
   {/* <Footer /> */}

   {(!isComponentsPage) && <Footer />}
  </div>
  );
}

function App() {
  return (
  <Router>
   <Layout />
	</Router>
  )
}

export default App
