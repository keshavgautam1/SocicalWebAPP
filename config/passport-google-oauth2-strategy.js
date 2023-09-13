const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');

// tell passport to use a new strategy for google login
passport.use(
  new googleStrategy(
    {
      clientID: "516438785864-hi4vsfu3o84jkqrp15t25r0f4gpmoia0.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/users/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Find a user based on the email provided by Google profile
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If found, set this user as req.user
          return done(null, user);
        } else {
          // If not found, create the user and set it as req.user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(20).toString('hex'),
          });

          return done(null, user);
        }
      } catch (err) {
        // Handle any errors that occur during the operation
        console.log("Error in Google strategy-passport:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
