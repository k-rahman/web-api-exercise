const express = require('express');
const router = express.Router();
const db = require('../db/index');

// return item by id
router.get('/:itemId', (req, res) => {
  const { itemId } = req.params;

  db
    .query('SELECT * FROM items WHERE itemId = ?', itemId)
    .then(item => res.send(item))
    .catch(err => console.log(err));
});

// return all items
router.get('/', (req, res) => {
  db
    .query('SELECT * FROM items')
    .then(items => res.send(items))
    .catch(err => console.log(err));
});

// delete item by id
router.delete('/:itemId', (req, res) => {
  const { itemId } = req.params;

  db
    .query('DELETE FROM items WHERE itemId = ?', itemId)
    .then(res.send(200))
    .catch(err => console.log(err));
});

module.exports = router;