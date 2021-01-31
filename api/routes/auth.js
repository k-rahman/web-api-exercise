const express = require('express');
const passport = require('passport');
require('../middleware/auth');

const router = express.Router();

// login user
router.post('/', (req, res, next) => {
  passport.authenticate('httpBasic', { session: false }, (err, result) => {
    if (err) return res.sendStatus(500);

    // user didn't supply username or password or email wasn't valid
    !result || result.message ?
      res.status(401).send({ code: '401', message: result.message || 'Invalid email or password!' }) :
      res.status(200).send({ token: result });
  })(req, res, next);
});

module.exports = router;