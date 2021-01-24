const os = require('os');
const express = require('express');
const cors = require('cors');

// routes imports
const items = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3200;

app.use(cors());

// routes
app.use('/items', items);

app.listen(PORT, () => {
  console.log(`Server is running on http://${os.networkInterfaces().enp5s0[0].address}:${PORT} ...`);
});