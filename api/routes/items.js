const express = require('express');
const router = express.Router();

const db = require('../db/index');
const items = require('../services/items');
const getImages = require('../middleware/images');
const validate = require('../middleware/validate').validateNewItem;
const authenticate = require('../middleware/auth');


// return item by id
router.get('/:itemId', (req, res) => {
  const { itemId } = req.params;

  items
    .getItemById(itemId)
    .then(item => res.status(200).send(item))
    .catch(e => e.name === 404 ?
      res.status(404).send({ code: '404', message: e.message }) :
      res.sendStatus(500));
});

// return all items // TODO
router.get('/', (req, res) => {
  db
    .query('SELECT * FROM items')
    .then(items => res.send(items))
    .catch(err => console.log(err));
});

// post new item
router.post('/', [getImages, validate, authenticate], (req, res) => {
  const { user } = req;

  items
    .createNewItem({ ...req.body, sellerId: user.userId })
    .then(result => res.status(201).send({ itemId: result.insertId }))
    .catch(_ => res.sendStatus(500));
});

// update item
router.put('/:itemId', [getImages, validate, authenticate], (req, res) => {
  const { itemId } = req.params;
  const { user } = req;

  items
    .updateItem({ ...req.body, sellerId: user.userId }, itemId)
    .then(_ => res.sendStatus(204))
    .catch(e => {
      if (e.name === 403) return res.status(403).send({ code: '403', message: e.message });
      if (e.name === 404) return res.status(404).send({ code: '404', message: e.message });

      res.sendStatus(500);
    });
});

// delete item by id
router.delete('/:itemId', authenticate, (req, res) => {
  const { itemId } = req.params;
  const { user } = req;

  items
    .deleteItem(itemId, user.userId)
    .then(_ => res.sendStatus(204))
    .catch(e => {
      if (e.name === 403) return res.status(403).send({ code: '403', message: e.message });
      if (e.name === 404) return res.status(404).send({ code: '404', message: e.message });

      res.sendStatus(500);
    });
});

module.exports = router;