const express = require('express');
const passport = require('passport');
require('../middleware/auth');
const router = express.Router();
const users = require('../services/users');
const validateUserData = require('../middleware/validate');


// get user information
router.get('/me', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, userId) => {
    if (err) return res.sendStatus(500);

    userId ?
      users
        .getUserById(userId)
        .then(result => result.userId ?
          res.status(200).send(result) :
          res.status(404).send({ code: '404', message: result }))
        .catch(_ => res.sendStatus(500)) :
      res.status(401).send({ code: '401', message: 'Access token is missing or invalid!' });
  })(req, res, next)
});

// update user
router.put('/me', validateUserData, (req, res, next) => {
  passport.authenticate('jwt', (err, userId) => {
    if (err) return res.sendStatus(500);

    userId ?
      users
        .updateUser(req.body, userId)
        .then(result => {
          if (!result) return res.sendStatus(204);
          if (result === 'User Doesn\'t Exist!') return res.status(404).send({ code: '404', message: result });
          return res.status(400).send({ code: '400', message: result });
        })
        .catch(_ => res.sendStatus(500)) :
      res.status(401).send({ code: '401', message: 'Access token is missing or invalid!' });
  })(req, res, next);
});

// delete user
router.delete('/me', (req, res, next) => {
  passport.authenticate('jwt', (err, userId) => {
    if (err) return res.sendStatus(500);

    userId ?
      users
        .deleteUser(userId)
        .then(result => !result ?
          res.sendStatus(204) :
          res.status(404).send({ code: '404', message: result }))
        .catch(_ => res.sendStatus(500)) :
      res.status(401).send({ code: '401', message: 'Access token is missing or invalid!' });
  })(req, res, next);
});

module.exports = router;