const express = require('express');
const router = express.Router();
const users = require('../services/users');
const validateUserData = require('../middleware/validate');

// create new user
router.post('/', validateUserData, (req, res) => {
  users
    .createUser(req.body)
    .then(result => result.insertId ?
      res.status(201).send({ code: '201', message: result.insertId.toString() }) :
      res.status(400).send({ code: '400', message: result })
    )
    .catch(_ => res.sendStatus(500));
});


module.exports = router;