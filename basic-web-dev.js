// Basic Web Development Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeBasicWebDevPage();
});

function initializeBasicWebDevPage() {
    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Add interactive code examples
    addCodeExampleInteractions();

    // Add smooth scrolling for anchor links
    addSmoothScrolling();
}

function addCodeExampleInteractions() {
    // Add copy-to-clipboard functionality to code examples
    const codeBlocks = document.querySelectorAll('.code-example pre code');

    codeBlocks.forEach(block => {
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.className = 'copy-btn';
        copyBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #4a5568;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8em;
        `;

        // Make code block position relative
        const pre = block.parentElement;
        pre.style.position = 'relative';

        pre.appendChild(copyBtn);

        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(block.textContent).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = '#38a169';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.style.background = '#4a5568';
                }, 2000);
            });
        });
    });
}

function addSmoothScrolling() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function logout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('email');

    // Redirect to login page
    window.location.href = 'login.html';
}

// Add some interactive elements for learning
function createInteractiveDemo() {
    // This could be expanded to include interactive HTML/CSS demos
    // For now, just add some hover effects and animations
    const concepts = document.querySelectorAll('.css-concept, .db-concept, .web-dev-component');

    concepts.forEach(concept => {
        concept.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });

        concept.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Call interactive demo function
createInteractiveDemo();