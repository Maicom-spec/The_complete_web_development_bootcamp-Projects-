//jshint esversion:6
require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const GoogleStrategy = require('passport-google-oauth20').Strategy
var findOrCreate = require('mongoose-findorcreate')

const port = 5000
const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: "Out little secret.",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})

const userSchema = new mongoose.Schema ({
    email: String,
    password: String, 
    googleId: String,
    secret: String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())
// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

passport.serializeUser(function(user, done) {
    done(null, user._id);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {

    console.log(profile)

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", (req, res) => {
    res.render('home')
})  

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", (req, res) => {
    res.render('login')
})

app.get("/submit", (req, res) => {
    if(req.isAuthenticated()){
        res.render("submit")
    } else {
        res.redirect("/login")
    }
})

app.post('/submit', (req, res) => {
    const submittedSecret = req.body.secret

    User.findById(req.user.id, (err, foundUser) => {
        if(err){
            console.log(err)
        } else {
            if(foundUser) {
                foundUser.secret = submittedSecret
                foundUser.save(() => {
                    res.redirect('/secrets')
                })
            }
        }
    })
})

app.get("/register", (req, res) => {
    res.render('register')
})

app.get("/secrets", (req, res) => {
    User.find({"secret": {$ne:null}}, (err, foundUsers) => {
        if(err) {
            console.log(err)
        } else {
            if(foundUsers) {
                res.render("secrets", {userWithSecrets: foundUsers})
            }
        }
    })
})

app.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

app.post("/register", (req, res) => {

    const username = req.body.username
    const password = req.body.password

    User.register({username: username}, password, (err, user) => {
        if(err){
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })
})

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const user = new User({
        username: username,
        password: password
    })

    req.login(user, (err) => {
        if(err){
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })

})


app.listen(port, (req, res) => {
    console.log(`Server running on port ${port}`)
})