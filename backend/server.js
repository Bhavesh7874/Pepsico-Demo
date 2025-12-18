const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));

app.get('/', (req, res) => {
    res.send('Pepsico Backend Running');
});

const PORT = 5002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
