const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log('Environment Variables:', process.env); // Debugging line to check all environment variables

const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
