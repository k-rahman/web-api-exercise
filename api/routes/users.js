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
        .then(result => res.status(200).send(result))
        .catch(e => e.name === 404 ?
          res.status(404).send({ code: '404', message: e.message }) :
          res.sendStatus(500)
        ) :
      res.status(401).send({ code: '401', message: 'Access token is missing or invalid!' });
  })(req, res, next);
});

// update user
router.put('/me', validateUserData, (req, res, next) => {
  passport.authenticate('jwt', (err, userId) => {
    if (err) return res.sendStatus(500);

    userId ?
      users
        .updateUser(req.body, userId)
        .then(_ => res.sendStatus(204))
        .catch(e => {
          if (e.name === 404)
            return res.status(404).send({ code: '404', message: e.message });
          if (e.name === 400)
            return res.status(400).send({ code: '400', message: e.message });

          res.sendStatus(500);
        }) :
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
        .then(_ => res.sendStatus(204))
        .catch(e => e.name === 404 ?
          res.status(404).send({ code: '404', message: e.message }) :
          res.sendStatus(500)
        ) :
      res.status(401).send({ code: '401', message: 'Access token is missing or invalid!' });
  })(req, res, next);
});

module.exports = router;