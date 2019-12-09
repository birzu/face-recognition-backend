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

// home route
app.get('/', (req, res) => {
  res.send('FACE-RECOGNITION-API\nRequest to /user/detect with src url to get face detection info in an image')
});

// server
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));