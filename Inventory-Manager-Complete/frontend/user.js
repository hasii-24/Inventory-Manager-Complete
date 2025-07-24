function placeOrder(productId, productName, price) {
  const quantity = prompt(`How many "${productName}" would you like to buy?`);
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    alert('Please enter a valid quantity');
    return;
  }

  const username = localStorage.getItem("username");

  fetch(https://inventory-manager-complete.onrender.com/api/login", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      quantity: parseInt(quantity),
      username
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message === 'Order placed') {
      alert(`✅ Order successful! Your Order ID is: ${data.orderId}`);

      const redirectURL = `generate-invoice.html?orderId=${data.orderId}&product=${encodeURIComponent(productName)}&quantity=${quantity}&price=${price}`;
      window.location.href = redirectURL;
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  })
  .catch(err => {
    alert('❌ Error placing order');
    console.error(err);
  });
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("viewProducts").addEventListener("click", () => {
  fetch("http://localhost:5000/api/products")
    .then(res => res.json())
    .then(products => {
      const content = document.getElementById("contentArea");
      content.innerHTML = "<h2>Available Products</h2>";

      if (!Array.isArray(products) || products.length === 0) {
        content.innerHTML += "<p>No products available.</p>";
        return;
      }

      const scrollContainer = document.createElement("div");
      scrollContainer.style.display = "flex";
      scrollContainer.style.overflowX = "auto";
      scrollContainer.style.gap = "20px";
      scrollContainer.style.padding = "20px 0";

      products.forEach(p => {
        const card = document.createElement("div");
        card.style.flex = "0 0 auto";
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "8px";
        card.style.padding = "15px";
        card.style.minWidth = "200px";
        card.style.background = "#fafafa";
        card.style.textAlign = "center";
        card.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
        card.style.transition = "transform 0.3s ease";
        card.style.cursor = "pointer";
        card.onmouseover = () => card.style.transform = "scale(1.05)";
        card.onmouseout = () => card.style.transform = "scale(1)";

        card.innerHTML = `
          <h3>${p.name}</h3>
          <img src="http://localhost:5000/images/${p.image}" alt="${p.name}" width="150" height="150" style="object-fit: contain;"/>
          <p><strong>Price:</strong> ₹${p.price}</p>
          <p><strong>Stock Left:</strong> ${p.quantity}</p>
          <button onclick="placeOrder('${p._id}', '${p.name}', ${p.price})">Buy</button>
        `;

        scrollContainer.appendChild(card);
      });

      content.appendChild(scrollContainer);
    })
    .catch(err => {
      alert("Failed to load products");
      console.error(err);
    });
});

// ✅ Load products by default
window.onload = () => {
  document.getElementById("viewProducts").click();
};
