const API_BASE_URL = 'http://localhost:3000/api';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error?.message || 'Login failed.');
            return;
        }

        const data = await response.json();

        // Store the token so we can authenticate requests later
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('email', data.user.email);

        window.location.href = 'home.html';
    } catch (err) {
        console.error(err);
        alert('Unable to reach the server. Make sure the backend is running.');
    }
});
