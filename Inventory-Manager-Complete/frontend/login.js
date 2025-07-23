// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('username', username); // ✅ Save username for future orders
    localStorage.setItem('role', role); // Optional: Store role if needed

    if (role === 'admin') {
      window.location.href = 'admindashboard.html';
    } else {
      window.location.href = 'userdashboard.html';
    }
  } else {
    alert(data.message);
  }
});

// Signup Form Submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;

  const res = await fetch('http://localhost:5000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });

  const data = await res.json();

  if (data.success) {
    alert('Signup successful, please login.');
    document.getElementById('signupDiv').style.display = 'none';
    document.getElementById('loginDiv').style.display = 'block';
  } else {
    alert('Signup failed: ' + data.message);
  }
});

// Toggle to Signup
function showSignup() {
  document.getElementById('loginDiv').style.display = 'none';
  document.getElementById('signupDiv').style.display = 'block';
}

// Toggle to Login
function showLogin() {
  document.getElementById('loginDiv').style.display = 'block';
  document.getElementById('signupDiv').style.display = 'none';
}
