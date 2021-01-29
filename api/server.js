const os = require('os');
const express = require('express');
const cors = require('cors');
const db = require('./db/index');

// routes imports
const items = require('./routes/items');
const users = require('./routes/users');
const register = require('./routes/register');
const auth = require('./routes/auth');

const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use('/items', items);
app.use('/users', users);
app.use('/register', register);
app.use('/auth', auth);

//db.create().catch(e => console.log(e));

const PORT = process.env.PORT || 3200;
module.exports = app.listen(PORT, () => {
  console.log(`Server is running on http://${os.networkInterfaces().enp5s0[0].address}:${PORT} ...`);
});