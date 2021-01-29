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

      if (!user[0].userId) done(null, false);

      await bcrypt.compare(password, user[0].password) ?
        done(null, jwt.sign({ userId: user[0].userId }, config.get('jwt'))) :
        done(null, false);
    }
    catch (e) {
      console.log(e);
      done(e);
    }
  })
);

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('jwt')
},
  (payload, done) => {
    done(null, payload.userId);
  })
);

