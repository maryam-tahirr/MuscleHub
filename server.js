import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

const FAVQS_API_KEY = '7c498b890914f82228f154baf7ee9743';

app.get('/api/quote', async (req, res) => {
  try {
    const response = await fetch('https://favqs.com/api/quotes/?filter=motivation&type=tag', {
      headers: {
        'Authorization': `Token token="${FAVQS_API_KEY}"`
      }
    });
    const data = await response.json();
    const random = data.quotes[Math.floor(Math.random() * data.quotes.length)];

    res.json({
      quote: random.body,
      author: random.author
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch filtered quote' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
