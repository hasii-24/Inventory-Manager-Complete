function showSection(sectionId) {
  document.getElementById('orders').style.display = 'none';
  document.getElementById('stock').style.display = 'none';
  document.getElementById('add-product-form-section').style.display = 'none';
  document.getElementById('predict-section').style.display = 'none';

  document.getElementById(sectionId).style.display = 'block';

  if (sectionId === 'orders') fetchPurchasedStock();
  if (sectionId === 'stock') fetchAllProducts();
  if (sectionId === 'predict-section') loadStockPredictionChart();
}

async function fetchPurchasedStock() {
  const container = document.getElementById('purchasedContainer');
  container.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch('https://inventory-manager-complete.onrender.com/api/orders/aggregated');
    const data = await res.json();
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '15px';

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="/images/${item.image}" width="100" height="100" style="object-fit: cover;">
        <p><strong>${item.name}</strong></p>
        <p>Total Purchased: ${item.totalPurchased}</p>
      `;
      wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
  } catch (err) {
    container.innerHTML = '<p style="color:red;">Error fetching purchased stock.</p>';
  }
}

async function fetchAllProducts() {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch('https://inventory-manager-complete.onrender.com/api/products');
    const products = await res.json();
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.gap = '15px';

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="/images/${product.image}" width="100" height="100" style="object-fit: cover;">
        <p><strong>${product.name}</strong></p>
        <p>Qty: ${product.quantity}</p>
        <p>Price: ₹${product.price}</p>
        <button onclick="editProduct('${product._id}')">Edit</button>
        <button onclick="deleteProduct('${product._id}')">Delete</button>
      `;
      wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
  } catch (err) {
    container.innerHTML = '<p style="color:red;">Error fetching products.</p>';
  }
}

async function editProduct(id) {
  const newName = prompt("Enter new product name:");
  const newQty = prompt("Enter new quantity:");
  const newPrice = prompt("Enter new price:");
  if (!newName || !newQty || !newPrice) return;

  try {
    const res = await fetch(`https://inventory-manager-complete.onrender.com/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, quantity: newQty, price: newPrice })
    });
    const result = await res.json();
    alert(result.message);
    fetchAllProducts();
  } catch {
    alert("Error updating product.");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    const res = fetch(`https://inventory-manager-complete.onrender.com/api/products/${id}`, { method: 'DELETE' });
    const result = await res.json();
    alert(result.message);
    fetchAllProducts();
  } catch {
    alert("Error deleting product.");
  }
}

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;
  const image = document.getElementById('image').value;

  try {
    const res = await fetch(`https://inventory-manager-complete.onrender.com/api/products/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity, price, image })
    });
    const data = await res.json();
    document.getElementById('addProductMsg').innerText = data.message;
    document.getElementById('addProductForm').reset();
  } catch {
    document.getElementById('addProductMsg').innerText = 'Error adding product.';
  }
});


function loadStockPredictionChart() {
  fetch('https://inventory-manager-flask.onrender.com/predict')

    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid data format from Flask');
      renderChart(data);
    })
    .catch(err => {
      console.error('Error fetching prediction data:', err);
      const container = document.getElementById('predict-section');
      container.innerHTML += '<p style="color:red;">Failed to load chart.</p>';
    });
}

function renderChart(data) {
  const ctx = document.getElementById('predictionChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Available Stock',
          data: data.map(item => item.available),
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        },
        {
          label: 'Purchased Stock',
          data: data.map(item => item.purchased),
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Stock Prediction' }
      },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Navbar event bindings
document.getElementById('view-orders').addEventListener('click', () => showSection('orders'));
document.getElementById('manage-stock').addEventListener('click', () => showSection('stock'));
document.getElementById('add-product').addEventListener('click', () => showSection('add-product-form-section'));
document.getElementById('stockPredictionBtn').addEventListener('click', () => showSection('predict-section'));
document.getElementById('logoutBtn').addEventListener('click', () => window.location.href = 'index.html');
