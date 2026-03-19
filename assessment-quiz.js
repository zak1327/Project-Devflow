// Assessment Quiz logic with random questions

let quizForm;
let resultContainer;
let resetButton;
let quizContainer;

// Pool of 20 questions: 10 code development, 10 web design
const questionsPool = [
    // Code Development (10)
    { type: 'mc', question: 'What does HTML stand for?', options: ['Hypertext Markup Language', 'Hyper Transfer Markup Language', 'Hyperlink Machine Language'], correct: 'A' },
    { type: 'mc', question: 'Which CSS property controls the text color?', options: ['font-style', 'color', 'background-color'], correct: 'B' },
    { type: 'mc', question: 'Which JavaScript keyword is used to declare a constant?', options: ['const', 'let', 'var'], correct: 'A' },
    { type: 'mc', question: 'Which HTML element is used to create a link?', options: ['&lt;link&gt;', '&lt;a&gt;', '&lt;br&gt;'], correct: 'B' },
    { type: 'mc', question: 'Which property is used to change the layout direction in CSS Flexbox?', options: ['justify-content', 'flex-direction', 'align-items'], correct: 'B' },
    { type: 'enum', question: 'Name the HTML tag used for ordered lists.', correct: 'ol' },
    { type: 'enum', question: 'What is the JavaScript method used to select an element by its ID?', correct: 'getElementById' },
    { type: 'enum', question: 'In CSS, which property is used to add space inside an element?', correct: 'padding' },
    { type: 'enum', question: 'What does "DOM" stand for?', correct: 'document object model' },
    { type: 'enum', question: 'Which HTML tag is used to include JavaScript?', correct: 'script' },

    // Web Design (10)
    { type: 'mc', question: 'What is the purpose of responsive design?', options: ['To make websites load faster', 'To ensure websites adapt to different screen sizes', 'To add animations'], correct: 'B' },
    { type: 'mc', question: 'Which CSS unit is relative to the font size of the root element?', options: ['px', 'em', 'rem'], correct: 'C' },
    { type: 'mc', question: 'What does UX stand for in web design?', options: ['User Experience', 'User Extension', 'Universal Experience'], correct: 'A' },
    { type: 'mc', question: 'Which HTML5 element is used for semantic structure?', options: ['&lt;div&gt;', '&lt;section&gt;', '&lt;span&gt;'], correct: 'B' },
    { type: 'mc', question: 'What is the role of a wireframe in web design?', options: ['To add colors', 'To outline the basic layout', 'To write code'], correct: 'B' },
    { type: 'enum', question: 'Name a popular CSS framework for responsive design.', correct: 'bootstrap' },
    { type: 'enum', question: 'What does "CSS" stand for?', correct: 'cascading style sheets' },
    { type: 'enum', question: 'Which property in CSS is used to create rounded corners?', correct: 'border-radius' },
    { type: 'enum', question: 'What is the term for the space between elements in CSS?', correct: 'margin' },
    { type: 'enum', question: 'Which tool is commonly used for prototyping web designs?', correct: 'figma' },
];

let currentQuestions = [];

// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Select random questions: 5 MC and 5 enum, assign to fixed positions
function selectRandomQuestions() {
    const mcQuestions = questionsPool.filter(q => q.type === 'mc');
    const enumQuestions = questionsPool.filter(q => q.type === 'enum');

    const selectedMC = shuffleArray([...mcQuestions]).slice(0, 5);
    const selectedEnum = shuffleArray([...enumQuestions]).slice(0, 5);

    currentQuestions = [...selectedMC, ...selectedEnum]; // First 5 MC, next 5 enum
}

// Render questions
function renderQuestions() {
    quizContainer.innerHTML = '';

    const mcBlock = document.createElement('div');
    mcBlock.className = 'quiz-block';
    mcBlock.innerHTML = '<h3>Multiple Choice (Select one)</h3>';

    const enumBlock = document.createElement('div');
    enumBlock.className = 'quiz-block';
    enumBlock.innerHTML = '<h3>Enumeration (Type your answers)</h3>';

    // Render MC questions (1-5)
    currentQuestions.slice(0, 5).forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.innerHTML = `<p>${index + 1}) ${q.question}</p>`;

        q.options.forEach((opt, optIndex) => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="radio" name="q${index + 1}" value="${String.fromCharCode(65 + optIndex)}" required> ${String.fromCharCode(65 + optIndex)}) ${opt}`;
            questionDiv.appendChild(label);
        });
        mcBlock.appendChild(questionDiv);
    });

    // Render enum questions (6-10)
    currentQuestions.slice(5, 10).forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.innerHTML = `<p>${index + 6}) ${q.question}</p>`;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = `q${index + 6}`;
        input.required = true;
        questionDiv.appendChild(input);
        enumBlock.appendChild(questionDiv);
    });

    quizContainer.appendChild(mcBlock);
    quizContainer.appendChild(enumBlock);
}

// Initialize quiz on load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    quizForm = document.getElementById('assessmentForm');
    resultContainer = document.getElementById('quizResult');
    resetButton = document.getElementById('resetQuiz');
    quizContainer = document.getElementById('quizContainer');

    selectRandomQuestions();
    renderQuestions();

    // Reset button
    resetButton.addEventListener('click', function() {
        selectRandomQuestions();
        renderQuestions();
        resultContainer.innerHTML = '';
    });

    // Form submit
    quizForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(quizForm);
        const score = calculateScore(formData);
        renderResult(score, formData);
    });
});

function normalizeAnswer(value) {
    return String(value).trim().toLowerCase();
}

function checkEnumeration(userValue, correct) {
    const expected = normalizeAnswer(correct);
    const actual = normalizeAnswer(userValue);
    return actual === expected;
}

function calculateScore(formData) {
    let score = 0;
    currentQuestions.forEach((q, index) => {
        const key = `q${index + 1}`;
        const userAnswer = formData.get(key);

        if (q.type === 'mc') {
            if (userAnswer === q.correct) {
                score += 1;
            }
        } else {
            if (checkEnumeration(userAnswer, q.correct)) {
                score += 1;
            }
        }
    });
    return score;
}

function renderResult(score, formData) {
    const percentage = Math.round((score / 10) * 100);
    let message = `You scored ${score} out of 10 (${percentage}%). `;

    if (percentage >= 80) {
        message += 'Great work!';
    } else if (percentage >= 50) {
        message += 'Not bad — keep practicing.';
    } else {
        message += 'Keep learning and try again!';
    }

    let answerDetails = '<div class="answer-details"><h4>Answer Review:</h4>';
    
    currentQuestions.forEach((q, index) => {
        const key = `q${index + 1}`;
        const userAnswer = formData.get(key);
        let isCorrect = false;

        if (q.type === 'mc') {
            isCorrect = userAnswer === q.correct;
        } else {
            isCorrect = checkEnumeration(userAnswer, q.correct);
        }

        const status = isCorrect ? '<span class="correct">✓ Correct</span>' : '<span class="incorrect">✗ Wrong</span>';
        
        if (q.type === 'mc') {
            const correctLabel = String.fromCharCode(65 + q.options.findIndex(opt => q.correct === String.fromCharCode(65 + q.options.indexOf(opt))));
            answerDetails += `<div class="answer-item"><p><strong>Q${index + 1}:</strong> ${status}</p>`;
            if (!isCorrect) {
                answerDetails += `<p class="correct-answer">Correct answer: <strong>${q.correct}) ${q.options[q.correct.charCodeAt(0) - 65]}</strong></p>`;
            }
            answerDetails += `</div>`;
        } else {
            answerDetails += `<div class="answer-item"><p><strong>Q${index + 1}:</strong> ${status}</p>`;
            if (!isCorrect) {
                answerDetails += `<p class="correct-answer">Correct answer: <strong>${q.correct}</strong></p>`;
            }
            answerDetails += `</div>`;
        }
    });

    answerDetails += '</div>';

    // Save score to localStorage
    saveQuizScore('assessment', score, 10);

    resultContainer.innerHTML = `<div class="quiz-result-box"><strong>Result:</strong> ${message}</div>${answerDetails}`;
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
