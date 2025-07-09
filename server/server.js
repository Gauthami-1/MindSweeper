const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5050;

// Always use absolute path
const SCORE_FILE = path.join(__dirname, 'scores.json');

// Middleware
app.use(cors());
app.use(express.json());

// GET endpoint: safely read file
app.get('/api/scores', (req, res) => {
  try {
    const data = fs.readFileSync(SCORE_FILE, 'utf-8');
    console.log('Serving scores:', data);
    res.status(200).json(JSON.parse(data));
  } catch (err) {
    console.error('READ ERROR:', err);
    res.status(500).json({ error: 'Could not read scores.json' });
  }
});

// POST endpoint: update win/loss count
app.post('/api/scores', (req, res) => {
  try {
    const scores = JSON.parse(fs.readFileSync(SCORE_FILE, 'utf-8'));
    if (req.body.win) scores.wins += 1;
    if (req.body.loss) scores.losses += 1;
    fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));
    console.log('Updated scores:', scores);
    res.status(200).json(scores);
  } catch (err) {
    console.error('WRITE ERROR:', err);
    res.status(500).json({ error: 'Could not update scores.json' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
