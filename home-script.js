const API_BASE_URL = 'http://localhost:3000/api';

async function ensureLoggedIn() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Not authenticated');
        }

        // Optionally use response data (e.g. to show the username)
        const data = await response.json();
        localStorage.setItem('username', data.user.username);
    } catch (err) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }
}

window.addEventListener('load', ensureLoggedIn);

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Clear login session
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    
    // Redirect to front page
    window.location.href = 'ProjectDevflow.html';
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Get Started button click handler
document.querySelector('.btn').addEventListener('click', function() {
    const aboutSection = document.querySelector('#services');
    if (aboutSection) {
        aboutSection.scrollIntoView({
            behavior: 'smooth'
        });
    }
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.getAttribute('href');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
