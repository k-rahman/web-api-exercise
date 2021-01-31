const passport = require('passport');
const httpBasic = require('passport-http').BasicStrategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('config');
const users = require('../services/users');

passport.use('httpBasic',
  new httpBasic(async (email, password, done) => {
    try {
      const user = await users.getUserByEmail(email);

      await bcrypt.compare(password, user[0].password) ?
        done(null, jwt.sign({ userId: user[0].userId }, config.get('jwt'))) :
        done(null, { name: 401, message: 'Invalid email or password!' });
    }
    catch (e) {
      e.message ? // catch when user email couldn't be found
        done(null, { name: 401, message: 'Invalid email or password!' }) :
        done(e);
    }
  })
);

// will throw return false if token is missing
// check if user exists
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('jwt')
},
  (payload, done) => {
    const { userId } = payload;

    userId ?
      users
        .getUserById(payload.userId)
        .then(user => done(null, user))
        .catch(e => done(e)) :
      done(null, false);
  })
);

// handle if token is invalid/missing
// handle if user doesn't exist
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if (err)
      if (err.name === 404)
        return res.status(404).send({ code: '404', message: err.message });
      else
        return res.sendStatus(500);

    if (user) {
      req.user = user;
      next();
    }
    else
      res.status(401).send({ code: '401', message: 'Access token is missing or invalid!' });

  })(req, res, next);
};

module.exports = authenticate;