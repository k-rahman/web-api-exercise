const express = require('express');
const router = express.Router();
const users = require('../services/users');
const validateUserData = require('../middleware/validate');

// create new user
router.post('/', validateUserData, (req, res) => {
  users
    .createUser(req.body)
    .then(result => res.status(201).send({ code: '201', message: result.insertId.toString() })
    )
    .catch(e => e.name === 400 ?
      res.status(400).send({ code: '400', message: e.message }) :
      res.sendStatus(500)
    );
});


module.exports = router;