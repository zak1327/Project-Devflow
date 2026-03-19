require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment. Copy .env.example to .env and set JWT_SECRET.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'devflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function ensureDatabase() {
  const dbName = process.env.MYSQL_DATABASE || 'devflow';
  const tempPool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 1,
  });

  try {
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  } finally {
    await tempPool.end();
  }
}

async function ensureSchema() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      email VARCHAR(256) NOT NULL UNIQUE,
      password_hash VARCHAR(256) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  const createQuizRecordTable = `
    CREATE TABLE IF NOT EXISTS quiz_record (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(256) NOT NULL,
      assessment_quiz INT,
      interactive_quiz INT,
      assessment_quiz_percentage INT,
      interactive_quiz_percentage INT,
      assessment_quiz_date TIMESTAMP,
      interactive_quiz_date TIMESTAMP,
      week_start_assessment DATE,
      week_start_interactive DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  await pool.query(createUsersTable);
  await pool.query(createQuizRecordTable);
}

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '2h',
  });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

const app = express();

// Serve the frontend pages directly (so you can open http://localhost:3000/login.html etc.)
app.use(express.static(path.join(__dirname)));

app.use(cors());
app.use(express.json());

app.post('/api/signup', async (req, res) => {
  const { email, username, password } = req.body;

  console.log('Signup request:', { email, username });

  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Email, username, and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email]);
    if (existing.length) {
      return res.status(409).json({ message: 'User with that email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const user = { id: result.insertId, username, email };
    const token = createToken(user);

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to create user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login request:', { username });

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT id, username, email, password_hash FROM users WHERE username = ? LIMIT 1', [username]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);
    return res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to authenticate' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  return res.json({ user: { id: req.user.id, username: req.user.username } });
});

app.post('/api/save-quiz-score', async (req, res) => {
  const { email, quizType, score, totalQuestions } = req.body;

  console.log('=== API: SAVE-QUIZ-SCORE RECEIVED ===');
  console.log('Email:', email);
  console.log('Quiz Type:', quizType);
  console.log('Score:', score, '/', totalQuestions);

  if (!email || !quizType || score === undefined) {
    console.error('Missing required fields!');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Fetch existing record
    const [existing] = await pool.query(
      'SELECT * FROM `quiz_record` WHERE `Email` = ?',
      [email]
    );

    if (existing.length > 0) {
      // Record exists, update it
      const record = existing[0];
      
      if (quizType === 'assessment') {
        console.log('Updating existing ASSESSMENT record for:', email);
        
        let highest = record['ASSESSMENT_QUIZ_HIGHEST'] !== null ? Math.max(score, record['ASSESSMENT_QUIZ_HIGHEST']) : score;
        let lowest = record['ASSESSMENT_QUIZ_LOWEST'] !== null ? Math.min(score, record['ASSESSMENT_QUIZ_LOWEST']) : score;
        
        console.log('New highest:', highest, 'New lowest:', lowest);
        
        await pool.query(
          'UPDATE `quiz_record` SET `SCORE ASSESMENT QUIZ` = ?, `ASSESSMENT_QUIZ_HIGHEST` = ?, `ASSESSMENT_QUIZ_LOWEST` = ? WHERE `Email` = ?',
          [score, highest, lowest, email]
        );
      } else if (quizType === 'interactive') {
        console.log('Updating existing INTERACTIVE record for:', email);
        
        let highest = record['INTERACTIVE_QUIZ_HIGHEST'] !== null ? Math.max(score, record['INTERACTIVE_QUIZ_HIGHEST']) : score;
        let lowest = record['INTERACTIVE_QUIZ_LOWEST'] !== null ? Math.min(score, record['INTERACTIVE_QUIZ_LOWEST']) : score;
        
        console.log('New highest:', highest, 'New lowest:', lowest);
        
        await pool.query(
          'UPDATE `quiz_record` SET `INTERACTIVE QUIZ` = ?, `INTERACTIVE_QUIZ_HIGHEST` = ?, `INTERACTIVE_QUIZ_LOWEST` = ? WHERE `Email` = ?',
          [score, highest, lowest, email]
        );
      }
    } else {
      // New record - create it with current, highest, and lowest all set to the same score
      if (quizType === 'assessment') {
        console.log('Creating new ASSESSMENT record for:', email);
        await pool.query(
          'INSERT INTO `quiz_record` (`Email`, `SCORE ASSESMENT QUIZ`, `ASSESSMENT_QUIZ_HIGHEST`, `ASSESSMENT_QUIZ_LOWEST`) VALUES (?, ?, ?, ?)',
          [email, score, score, score]
        );
      } else if (quizType === 'interactive') {
        console.log('Creating new INTERACTIVE record for:', email);
        await pool.query(
          'INSERT INTO `quiz_record` (`Email`, `INTERACTIVE QUIZ`, `INTERACTIVE_QUIZ_HIGHEST`, `INTERACTIVE_QUIZ_LOWEST`) VALUES (?, ?, ?, ?)',
          [email, score, score, score]
        );
      }
    }

    console.log('✓ Score saved successfully');
    return res.json({ message: 'Quiz score saved successfully' });
  } catch (err) {
    console.error('✗ Error saving score:', err);
    return res.status(500).json({ message: 'Unable to save quiz score' });
  }
});

app.get('/api/quiz-scores/:email', async (req, res) => {
  const { email } = req.params;
  
  console.log('=== API: QUIZ-SCORES GET RECEIVED ===');
  console.log('Email param:', email);

  try {
    const [rows] = await pool.query(
      'SELECT * FROM `quiz_record` WHERE `Email` = ?',
      [email]
    );

    console.log('Database query returned:', rows.length, 'records');
    console.log('Record data:', JSON.stringify(rows[0], null, 2));

    if (rows.length === 0) {
      console.log('No record found for email:', email);
      return res.json({ assessment: [], interactive: [] });
    }

    const record = rows[0];
    const assessment = [];
    const interactive = [];

    // Build assessment scores array
    if (record['SCORE ASSESMENT QUIZ'] !== null) {
      console.log('Assessment quiz found:', record['SCORE ASSESMENT QUIZ']);
      console.log('Highest:', record['ASSESSMENT_QUIZ_HIGHEST']);
      console.log('Lowest:', record['ASSESSMENT_QUIZ_LOWEST']);
      assessment.push({
        score: record['SCORE ASSESMENT QUIZ'],
        highest: record['ASSESSMENT_QUIZ_HIGHEST'],
        lowest: record['ASSESSMENT_QUIZ_LOWEST'],
        totalQuestions: 10,
        percentage: Math.round((record['SCORE ASSESMENT QUIZ'] / 10) * 100),
        date: new Date().toISOString(),
        weekStart: new Date().toISOString()
      });
    }

    // Build interactive scores array
    if (record['INTERACTIVE QUIZ'] !== null) {
      console.log('Interactive quiz found:', record['INTERACTIVE QUIZ']);
      console.log('Highest:', record['INTERACTIVE_QUIZ_HIGHEST']);
      console.log('Lowest:', record['INTERACTIVE_QUIZ_LOWEST']);
      interactive.push({
        score: record['INTERACTIVE QUIZ'],
        highest: record['INTERACTIVE_QUIZ_HIGHEST'],
        lowest: record['INTERACTIVE_QUIZ_LOWEST'],
        totalQuestions: 5,
        percentage: Math.round((record['INTERACTIVE QUIZ'] / 5) * 100),
        date: new Date().toISOString(),
        weekStart: new Date().toISOString()
      });
    }

    console.log('Returning data:', JSON.stringify({ assessment, interactive }, null, 2));
    return res.json({ assessment, interactive });
  } catch (err) {
    console.error('✗ Error fetching quiz scores:', err);
    return res.status(500).json({ message: 'Unable to retrieve quiz scores' });
  }
});

app.listen(PORT, async () => {
  try {
    await ensureDatabase();
    await ensureSchema();
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
});
