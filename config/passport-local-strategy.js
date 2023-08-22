const passport = require('passport');
const User = require('../models/user');

const LocalStrategy = require('passport-local').Strategy;

// Authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    async function (email, password, done) {
      try {
        // Find a user and establish the identity
        const user = await User.findOne({ email: email });

        if (!user || user.password !== password) {
          console.log('Invalid Username/Password');
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        console.log('Error in finding user-->Passport');
        return done(err);
      }
    }
  )
);

// Serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    console.log('Error in finding user-->Passport');
    return done(err);
  }
});

//check if the user is authenticated
passport.checkAuthentication = function(req, res, next){
    //if the user is signed in, then pass on the request to the next function(controller's action)
    if(req.isAuthenticated()){
        return next();
    }
    // if the user is not signed in 
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req, res, next){
if(req.isAuthenticated()){
    //req.user contains the current signed user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
    }
next();
}



module.exports = passport;