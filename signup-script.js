const API_BASE_URL = 'http://localhost:3000/api';

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error?.message || 'Signup failed.');
            return;
        }

        const data = await response.json();

        // Store token and user info
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);

        window.location.href = 'home.html';
    } catch (err) {
        console.error(err);
        alert('Unable to reach the server. Make sure the backend is running.');
    }
});
