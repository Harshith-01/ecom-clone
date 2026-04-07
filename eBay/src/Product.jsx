function Product() {

   const product1= "Phone";
	const product2= "Laptop";
   const product3= "Tablet";
  return (
   <div>
  <h2>Products Page</h2>
	<p>List of products will be displayed here.</p>
  <ul>
   	<li>{product1}</li>
     <li>{product2}</li>
     <li>{product3}</li>
	</ul>
   </div>
  )
}

export default Product;
