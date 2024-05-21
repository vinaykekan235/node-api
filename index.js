const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set in .env

app.get('/hello', (req, res) => {
    res.send('Hello');
});

app.post('/hello', (req, res) => {
    const { name } = req.body;
    res.send(`Hello, ${name}`);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
