const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

// Import the user model
const User = require('../models/user');

let opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'Socionize'
}


passport.use(new JWTStrategy(opts, async function(jwtPayload, done) {
    try {
        const user = await User.findById(jwtPayload._id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (err) {
        console.log('Error in finding user from JWT', err);
        return done(err, false);
    }
}));

module.exports = passport;
