const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

const PORT = 5000;
const SCORE_FILE = './scores.json';

app.use(cors());
app.use(express.json());

// Read current scores
app.get('/api/scores', (req, res) => {
  const data = fs.readFileSync(SCORE_FILE);
  res.json(JSON.parse(data));
});

// Update score (expects { win: true } or { loss: true })
app.post('/api/scores', (req, res) => {
  const scores = JSON.parse(fs.readFileSync(SCORE_FILE));
  if (req.body.win) scores.wins += 1;
  if (req.body.loss) scores.losses += 1;
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scores));
  res.json(scores);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
