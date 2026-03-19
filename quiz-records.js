// Quiz Records - Display scores and statistics

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function isSameWeek(date1, date2) {
    const start1 = getWeekStart(date1);
    const start2 = getWeekStart(date2);
    return start1.toDateString() === start2.toDateString();
}

function getQuizScores() {
    const username = localStorage.getItem('username') || 'guest';
    const email = localStorage.getItem('email') || username;
    
    console.log('Fetching scores for email:', email);
    
    return new Promise((resolve) => {
        // Try to fetch from API (database) first
        const encodedEmail = encodeURIComponent(email);
        console.log('Encoded email:', encodedEmail);
        
        fetch(`http://localhost:3000/api/quiz-scores/${encodedEmail}`)
            .then(response => response.json())
            .then(data => {
                console.log('Loaded from API/Database:', data);
                resolve(data);
            })
            .catch(error => {
                console.warn('API fetch failed, falling back to localStorage:', error);
                // Fallback to localStorage if API fails
                const assessmentScores = JSON.parse(localStorage.getItem(`quiz_scores_${username}_assessment`) || '[]');
                const interactiveScores = JSON.parse(localStorage.getItem(`quiz_scores_${username}_interactive`) || '[]');
                
                console.log('Loaded from localStorage - Assessment:', assessmentScores, 'Interactive:', interactiveScores);
                
                resolve({
                    assessment: assessmentScores,
                    interactive: interactiveScores
                });
            });
    });
}

function calculateAverageScore(scores) {
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return Math.round((total / scores.length) * 100) / 100;
}

function calculateOverallAverage(scores) {
    if (scores.length === 0) return 0;
    const percentages = scores.map(s => s.percentage);
    const total = percentages.reduce((sum, p) => sum + p, 0);
    return Math.round(total / percentages.length);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderRecords(assessment, interactive) {
    const recordsContainer = document.getElementById('recordsContainer');
    
    console.log('=== RENDERING RECORDS ===');
    console.log('Assessment data:', JSON.stringify(assessment, null, 2));
    console.log('Interactive data:', JSON.stringify(interactive, null, 2));
    
    let html = '';

    // Assessment Quiz Record
    if (assessment.length > 0) {
        const currentScore = assessment[0].score;
        const highestScore = assessment[0].highest !== null && assessment[0].highest !== undefined ? assessment[0].highest : currentScore;
        const lowestScore = assessment[0].lowest !== null && assessment[0].lowest !== undefined ? assessment[0].lowest : currentScore;
        
        console.log('Assessment - Current:', currentScore, 'Highest:', highestScore, 'Lowest:', lowestScore);
        
        html += `
            <div class="record-card assessment-card">
                <h3>📝 Assessment Quiz</h3>
                <div class="score-display">
                    <div class="current-score">
                        <span class="label">Current Score:</span>
                        <span class="value">${currentScore}/10</span>
                    </div>
                    <div class="highest-score">
                        <span class="label">Highest Score:</span>
                        <span class="value">${highestScore}/10</span>
                    </div>
                    <div class="lowest-score">
                        <span class="label">Lowest Score:</span>
                        <span class="value">${lowestScore}/10</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="record-card empty-card">
                <h3>📝 Assessment Quiz</h3>
                <p>No scores yet. <a href="review-quiz.html">Take the Assessment Quiz</a></p>
            </div>
        `;
    }

    // Interactive Quiz Record
    if (interactive.length > 0) {
        const currentScore = interactive[0].score;
        const highestScore = interactive[0].highest !== null && interactive[0].highest !== undefined ? interactive[0].highest : currentScore;
        const lowestScore = interactive[0].lowest !== null && interactive[0].lowest !== undefined ? interactive[0].lowest : currentScore;
        
        console.log('Interactive - Current:', currentScore, 'Highest:', highestScore, 'Lowest:', lowestScore);
        
        html += `
            <div class="record-card interactive-card">
                <h3>🎯 Interactive Quiz</h3>
                <div class="score-display">
                    <div class="current-score">
                        <span class="label">Current Score:</span>
                        <span class="value">${currentScore}/5</span>
                    </div>
                    <div class="highest-score">
                        <span class="label">Highest Score:</span>
                        <span class="value">${highestScore}/5</span>
                    </div>
                    <div class="lowest-score">
                        <span class="label">Lowest Score:</span>
                        <span class="value">${lowestScore}/5</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="record-card empty-card">
                <h3>🎯 Interactive Quiz</h3>
                <p>No scores yet. <a href="interactive-quiz.html">Take the Interactive Quiz</a></p>
            </div>
        `;
    }

    recordsContainer.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    getQuizScores().then(data => {
        renderRecords(data.assessment, data.interactive);
    });
});
