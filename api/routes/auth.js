const express = require('express');
const passport = require('passport');
require('../middleware/auth');

const router = express.Router();

// login user
router.post('/', (req, res, next) => {
  passport.authenticate('httpBasic', { session: false }, (err, jwt) => {
    if (err) return res.sendStatus(500);
    jwt ?
      res.status(200).send({ token: jwt }) :
      res.status(401).send({ code: '401', message: 'Invalid email or password!' });
  })(req, res, next);
});

module.exports = router;