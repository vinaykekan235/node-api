const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set in .env

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/hello', (req, res) => {
    res.send('Hello');
});

app.post('/data', (req, res) => {
    console.log("Received data:", req.body);

    // Destructure 'name' from req.body
    const { name } = req.body;

    // Check if 'name' is defined to avoid errors
    if (!name) {
        return res.status(400).send("Name is required");
    }

    res.status(200).send(`Hello, ${name}`);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
