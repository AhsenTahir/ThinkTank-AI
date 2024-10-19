const express = require('express');
const router = express.Router();
const { Mistral } = require('@mistralai/mistralai');

const apiKey = process.env.MISTRAL_API_KEY;


const client = new Mistral({ apiKey: apiKey });

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const chatResponse = await client.chat.complete({
      model: 'open-mistral-nemo',
      messages: [{ role: 'user', content: message }]
    });

    res.json({ response: chatResponse.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

module.exports = router;

