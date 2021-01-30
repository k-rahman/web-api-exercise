const express = require('express');
const router = express.Router();
const users = require('../services/users');
const validate = require('../middleware/validate').validateUserData;
const authenticate = require('../middleware/auth');


// get user information
router.get('/me', authenticate, (req, res) => {
  const { user } = req;

  res.status(200).send(user);
});

// update user
router.put('/me', [validate, authenticate], (req, res) => {
  const { user } = req;

  users
    .updateUser(req.body, user.userId)
    .then(_ => res.sendStatus(204))
    .catch(e => {
      e.name === 400 ?
        res.status(400).send({ code: '400', message: e.message }) :
        res.sendStatus(500);
    });
});

// delete user
router.delete('/me', authenticate, (req, res) => {
  const { user } = req;

  users
    .deleteUser(user.userId)
    .then(_ => res.sendStatus(204))
    .catch(_ => res.sendStatus(500));
});

module.exports = router;