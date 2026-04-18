import React from 'react';
import './Footer.css';

function Footer() {
  return (
   <footer className="footer-area">
  <div className="container footer-grid">
     <div className="f-col">
     <h4>Buy</h4>
	  <a href="#">Registration</a>
     <a href="#">Money Back Guarantee</a>
     <a href="#">Stores</a>
     </div>

     <div className="f-col">
  	<h4>Sell</h4>
     <a href="#">Start selling</a>
     <a href="#">Learn to sell</a>
	  <a href="#">Affiliates</a>
     </div>

     <div className="f-col">
     <h4>Stay Connected</h4>
	   <a href="#">eBay's Blogs</a>
     <a href="#">Facebook</a>
  	<a href="#">Twitter</a>
     </div>

	  <div className="f-col">
     <h4>About eBay</h4>
   	<a href="#">Company info</a>
     <a href="#">News</a>
     <a href="#">Investors</a>
	   <a href="#">Careers</a>
     <a href="#">Government relations</a>
  	</div>

     <div className="f-col">
	  <h4>Help & Contact</h4>
     <a href="#">Seller Information</a>
   	<a href="#">Contact us</a>
     <div className="country-box">
     	<span className="flag-icon"></span> India
	   </div>
     </div>
  </div>
      
  <div className="container footer-bottom">
	  <p>Copyright © 1995-2026 eBay Inc. All Rights Reserved.</p>
     <div className="legal-links">
   	   <a href="#">Accessibility</a>, <a href="#">User Agreement</a>, <a href="#">Privacy</a>, <a href="#">Cookies</a>
     </div>
   </div>
	</footer>
  )
}

export default Footer;
