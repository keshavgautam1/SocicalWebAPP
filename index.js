const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
//used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy'); //this is the strategy that we have defined
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

// const MongoStore = require('connect-mongo')(session); //this is used to store the session cookie in the db
const flash = require('connect-flash');
const customMware = require('./config/middleware');
const MongoStore = require('connect-mongo');


// Create a new instance of MongoStore
const sessionStore = new MongoStore({
    mongoUrl: 'mongodb://127.0.0.1:27017/Socionize_development',
    mongooseConnection: db,
    autoRemove: 'disabled'
});
// Handle error during session store creation
sessionStore.on('error', function(err) {
    console.log('Error in session store:', err);
});

app.use(express.urlencoded({ extended: true }));
 //middleware to parse the form data that is submitted by the user
app.use(cookieParser());

app.use(express.static('./assets'));
// make the uploads path available to the browser
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(expressLayouts);
//extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// mongo store is used to store the session cookie in the db 
app.use(session({
    name: 'socionize',
   // TODO change the secret before deployment in production mode
    secret: "blahsomthing",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: sessionStore //this is the session store that we have defined above
    
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMware.setFlash);
//use express router
app.use('/', require('./routes'));


// Start the server
app.listen(port, function(err){
    if (err){
        console.log(`Error in running the server: ${err}`);
    }else{
        console.log(`Server is running on port: ${port}`);
    }
});