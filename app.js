/* 
 * Package Imports
*/

const path = require("path");
require("dotenv").config();
const express = require('express');
const partials = require('express-partials');
const session = require('express-session'); //Import session so can start a session
const passport = require('passport'); //Import passport for authentication
const GitHubStrategy = require('passport-github2').Strategy; //Import a strategy to use with passport

const app = express();


/*
 * Variable Declarations
*/

const PORT = 3000;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

//Initalise a session
app.use(session({ 
  secret: 'codecademy',
  resave: false,
  saveUninitialized: false
}));

/*
 * Passport Configurations
*/

// Create an instance of GitHubStrategy, pass in JSON of clientId and Secret
passport.use(new GitHubStrategy({ 
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, 
function(acessToken, refreshToken, profile, done) { //Verify callback
  return done(null, profile) //Returns the profile 
}
));

//Serialise user (Set up user)
passport.serializeUser((user, done) => {
  return done(null, user)
});

//Deserialise user (Retrieve user )
passport.deserializeUser((user, done) => {
  return done(null, user)
})

/*
 *  Express Project Setup
*/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize()); //Initialise passport
app.use(passport.session());   //Configure app to use Passport session

/*
 * ensureAuthenticated Callback Function
*/

//Middleware that verifys if a request is authenticated.
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); //Move onto to next call if valid
  }
  res.redirect('/redirect') //Redirect if not valid 
}


/*
 * Routes
*/

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
})

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Middleware, when visiting /auth/github will be redirected to GitHub for authorising
app.get('/auth/github', passport.authenticate('github', { scope: ['user'] }))


//This is where GitHub will redirected after user authorises.
//Set up redirects for success and failure 
app.get('/auth/github/callback', passport.authenticate('github', { 
  failureRedirect: '/login', //Login page
  successRedirect: '/' //Home page 
}));


/*
 * Listener
*/

app.listen(PORT, () => console.log(`Listening on ${PORT}`));