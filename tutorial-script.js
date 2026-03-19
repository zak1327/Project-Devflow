// Tutorial Scripts

// Copy code to clipboard
function copyCode(button) {
    // Get the code element (previous sibling of button)
    const codeBlock = button.previousElementSibling;
    const code = codeBlock.innerText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
        // Show feedback
        button.textContent = '✓ Copied!';
        button.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.textContent = 'Copy Code';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            localStorage.removeItem('username');
            
            // Redirect to login
            window.location.href = 'login.html';
        });
    }
});

// Smooth scroll to sections (if needed)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#' + '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add click animation to interactive elements
const links = document.querySelectorAll('a, button');
links.forEach(link => {
    link.addEventListener('click', function() {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
});
