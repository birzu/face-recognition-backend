const express = require('express');
const cors = require('cors');

// init express
const app = express();
const PORT = process.env.PORT || 8080;

// middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use('/user', require('./route/user'));


// server
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));