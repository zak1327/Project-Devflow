// Interactive Quiz - Bug Fixing & Live Code Execution

const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');

const challenges = [
    {
        id: 1,
        type: 'bug-fix',
        title: 'Fix the Bug',
        instruction: 'This JavaScript code has a bug. Find and fix it.',
        code: 'let name = "Alice"\nconsole.log("Hello" + name);  // Missing space and semicolon',
        correct: 'let name = "Alice";\nconsole.log("Hello " + name);',
        hint: 'Check for missing semicolons and spacing in strings',
        language: 'javascript'
    },
    {
        id: 2,
        type: 'live-code',
        title: 'Live Code Challenge',
        instruction: 'Write JavaScript code to output: "Hello World"',
        expected: 'Hello World',
        hint: 'Use console.log() to display text',
        expectedCode: 'console.log("Hello World");',
        language: 'javascript'
    },
    {
        id: 3,
        type: 'bug-fix',
        title: 'Fix the CSS Bug',
        instruction: 'This CSS has a bug. Find and fix it.',
        code: '.box {\n  width: 100px\n  height: 100px;\n  background-color: blue;\n}',
        correct: '.box {\n  width: 100px;\n  height: 100px;\n  background-color: blue;\n}',
        hint: 'Missing semicolon after width property',
        language: 'css'
    },
    {
        id: 4,
        type: 'live-code',
        title: 'Live Code Challenge',
        instruction: 'Write JavaScript to calculate: 5 + 3 and output the result',
        expected: '8',
        expectedCode: 'console.log(5 + 3);',
        hint: 'Use console.log() with arithmetic',
        language: 'javascript'
    },
    {
        id: 5,
        type: 'live-code',
        title: 'Live Code Challenge',
        instruction: 'Write JavaScript to create a variable greeting with value "Welcome" and output it',
        expected: 'Welcome',
        expectedCode: 'let greeting = "Welcome";\nconsole.log(greeting);',
        hint: 'Store text in a variable and use console.log()',
        language: 'javascript'
    }
];

let currentChallengeIndex = 0;
let userAnswers = [];

function renderChallenge(index) {
    if (index >= challenges.length) {
        showResults();
        return;
    }

    quizContainer.innerHTML = '';
    const challenge = challenges[index];

    const challengeDiv = document.createElement('div');
    challengeDiv.className = 'challenge';

    let progressBar = `<div class="progress-bar">
        <div class="progress-fill" style="width: ${((index + 1) / challenges.length) * 100}%"></div>
        <span class="progress-text">${index + 1} of ${challenges.length}</span>
    </div>`;

    if (challenge.type === 'bug-fix') {
        challengeDiv.innerHTML = `
            ${progressBar}
            <h2>${challenge.title}</h2>
            <p class="instruction">${challenge.instruction}</p>
            <div class="code-display">
                <pre><code>${challenge.code}</code></pre>
            </div>
            <p class="hint">💡 Hint: ${challenge.hint}</p>
            <div class="challenge-form">
                <label>Your Fixed Code:</label>
                <textarea id="userCode" placeholder="Paste your fixed code here..." rows="8" class="code-input"></textarea>
                <div class="button-group">
                    <button class="btn" onclick="validateBugFix()">Check Answer</button>
                    <button class="btn btn-secondary" onclick="showFeedback()">Show Answer</button>
                    <button class="btn btn-skip" onclick="skipChallenge()">Skip</button>
                </div>
                <div id="feedback" class="feedback"></div>
            </div>
        `;
    } else {
        challengeDiv.innerHTML = `
            ${progressBar}
            <h2>${challenge.title}</h2>
            <p class="instruction">${challenge.instruction}</p>
            <p class="hint">💡 Hint: ${challenge.hint}</p>
            <div class="challenge-form">
                <label>Write Your Code:</label>
                <textarea id="userCode" placeholder="Write JavaScript code here..." rows="8" class="code-input"></textarea>
                <div class="code-output">
                    <strong>Output:</strong>
                    <div id="output" class="output-box"></div>
                </div>
                <div class="button-group">
                    <button class="btn" onclick="runCode()">Run Code</button>
                    <button class="btn btn-secondary" onclick="executeAndCheck()">Check Answer</button>
                    <button class="btn btn-skip" onclick="skipChallenge()">Skip</button>
                </div>
                <div id="feedback" class="feedback"></div>
            </div>
        `;
    }

    quizContainer.appendChild(challengeDiv);
}

function validateBugFix() {
    const userCode = document.getElementById('userCode').value.trim();
    const challenge = challenges[currentChallengeIndex];
    const feedback = document.getElementById('feedback');

    const userNormalized = userCode.replace(/\s/g, '').trim();
    const correctNormalized = challenge.correct.replace(/\s/g, '').trim();

    userAnswers.push({
        challengeId: challenge.id,
        type: challenge.type,
        userAnswer: userCode,
        correctAnswer: challenge.correct,
        isCorrect: userNormalized === correctNormalized
    });

    if (userNormalized === correctNormalized) {
        feedback.innerHTML = '<div class="success-message">✓ Correct! Moving to next challenge...</div>';
        setTimeout(() => {
            currentChallengeIndex++;
            renderChallenge(currentChallengeIndex);
        }, 1500);
    } else {
        feedback.innerHTML = '<div class="error-message">✗ Not quite right. Try again or click "Show Answer" for help.</div>';
    }
}

function runCode() {
    const userCode = document.getElementById('userCode').value;
    const output = document.getElementById('output');

    try {
        output.innerHTML = ''; // Clear previous output
        const originalLog = console.log;
        let capturedOutput = [];

        console.log = function (...args) {
            capturedOutput.push(args.join(' '));
        };

        eval(userCode);

        console.log = originalLog;

        if (capturedOutput.length === 0) {
            output.innerHTML = '<span class="no-output">(No output)</span>';
        } else {
            output.innerHTML = capturedOutput.map(line => `<div>${escapeHtml(line)}</div>`).join('');
        }
    } catch (error) {
        output.innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
    }
}

function executeAndCheck() {
    const userCode = document.getElementById('userCode').value;
    const challenge = challenges[currentChallengeIndex];
    const feedback = document.getElementById('feedback');

    try {
        let capturedOutput = [];
        const originalLog = console.log;

        console.log = function (...args) {
            capturedOutput.push(args.join(' '));
        };

        eval(userCode);

        console.log = originalLog;

        const actualOutput = capturedOutput.join('\n').trim();
        const expectedOutput = challenge.expected.trim();
        const isCorrect = actualOutput === expectedOutput;

        userAnswers.push({
            challengeId: challenge.id,
            type: challenge.type,
            userAnswer: userCode,
            correctAnswer: challenge.expectedCode,
            actualOutput: actualOutput,
            expectedOutput: expectedOutput,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            feedback.innerHTML = '<div class="success-message">✓ Correct! Moving to next challenge...</div>';
            setTimeout(() => {
                currentChallengeIndex++;
                renderChallenge(currentChallengeIndex);
            }, 1500);
        } else {
            feedback.innerHTML = `<div class="error-message">✗ Expected output: "${expectedOutput}", but got: "${actualOutput}"</div>`;
        }
    } catch (error) {
        feedback.innerHTML = `<div class="error-message">✗ Error: ${escapeHtml(error.message)}</div>`;
        userAnswers.push({
            challengeId: challenge.id,
            type: challenge.type,
            userAnswer: userCode,
            correctAnswer: challenge.expectedCode,
            isCorrect: false,
            error: error.message
        });
    }
}

function showFeedback() {
    const challenge = challenges[currentChallengeIndex];
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `<div class="answer-box"><strong>Correct Answer:</strong><pre><code>${challenge.correct || challenge.expectedCode}</code></pre></div>`;
}

function skipChallenge() {
    const challenge = challenges[currentChallengeIndex];
    const userCode = document.getElementById('userCode').value || '(Skipped)';

    userAnswers.push({
        challengeId: challenge.id,
        type: challenge.type,
        userAnswer: userCode,
        correctAnswer: challenge.correct || challenge.expectedCode,
        isCorrect: false,
        skipped: true
    });

    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '<div class="skip-message">⏭️ Skipped. Moving to next challenge...</div>';
    
    setTimeout(() => {
        currentChallengeIndex++;
        renderChallenge(currentChallengeIndex);
    }, 1500);
}

function showResults() {
    quizContainer.innerHTML = '';
    resultsContainer.classList.remove('hidden');

    let resultsHtml = `<div class="results"><h2>📊 Quiz Complete!</h2><p>You completed ${challenges.length} challenges. Here's your review:</p>`;

    userAnswers.forEach((answer, index) => {
        const statusClass = answer.isCorrect ? 'correct-item' : 'incorrect-item';
        const statusIcon = answer.isCorrect ? '✓' : '✗';
        const challenge = challenges.find(c => c.id === answer.challengeId);
        const skippedNote = answer.skipped ? '<p class="skipped-note">🚫 This challenge was skipped</p>' : '';

        resultsHtml += `<div class="result-item ${statusClass}">
            <h4>${statusIcon} Challenge ${index + 1}: ${challenge.type === 'bug-fix' ? 'Fix the Bug' : 'Live Code'}</h4>
            ${skippedNote}
            <div class="result-code">
                <strong>Your Answer:</strong>
                <pre><code>${escapeHtml(answer.userAnswer)}</code></pre>
            </div>
            <div class="result-code">
                <strong>Correct Answer:</strong>
                <pre><code>${escapeHtml(answer.correctAnswer)}</code></pre>
            </div>
            ${answer.actualOutput ? `<div class="result-info">
                <strong>Expected Output:</strong> ${escapeHtml(answer.expectedOutput)}<br>
                <strong>Your Output:</strong> ${escapeHtml(answer.actualOutput)}
            </div>` : ''}
            ${answer.error ? `<div class="result-error"><strong>Error:</strong> ${escapeHtml(answer.error)}</div>` : ''}
        </div>`;
    });

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / challenges.length) * 100);

    // Save score to database
    saveQuizScore('interactive', correctCount, challenges.length);

    resultsHtml += `<div class="results-summary">
        <h3>Score: ${correctCount}/${challenges.length} (${percentage}%)</h3>
        <button class="btn" onclick="restartQuiz()">Restart Quiz</button>
        <a href="review-quiz.html" class="btn btn-secondary">Back to Review Quiz</a>
    </div></div>`;

    resultsContainer.innerHTML = resultsHtml;
}

function saveQuizScore(quizType, score, totalQuestions) {
    const username = localStorage.getItem('username') || 'guest';
    const email = localStorage.getItem('email') || localStorage.getItem('username') || 'guest';

    console.log('=== SAVING QUIZ SCORE ===');
    console.log('Email:', email);
    console.log('Quiz Type:', quizType);
    console.log('Score:', score, '/', totalQuestions);

    const scoreData = {
        email: email,
        quizType: quizType,
        score: score,
        totalQuestions: totalQuestions
    };

    // Save to database via API
    if (email && email !== 'guest') {
        console.log('Sending to API:', scoreData);
        fetch('http://localhost:3000/api/save-quiz-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('✓ Score saved to database:', data);
        })
        .catch(error => {
            console.error('✗ Error saving to database:', error);
        });
    }
}

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

function restartQuiz() {
    currentChallengeIndex = 0;
    userAnswers = [];
    resultsContainer.classList.add('hidden');
    renderChallenge(0);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    renderChallenge(0);
});
