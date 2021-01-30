const express = require('express');
const router = express.Router();
const users = require('../services/users');
const validate = require('../middleware/validate').validateUserData;

// create new user
router.post('/', validate, (req, res) => {
  users
    .createUser(req.body)
    .then(result => res.status(201).send({ userId: result.insertId }))
    .catch(e => e.name === 400 ?
      res.status(400).send({ code: '400', message: e.message }) :
      res.sendStatus(500)
    );
});


module.exports = router;