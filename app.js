require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app = express();


app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect(`mongodb+srv://admin_subhranshu:${process.env.DB_KEY}@cluster0.one0j.mongodb.net/secretsApp`);

const userSkeliton = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
}); // schema

userSkeliton.plugin(passportLocalMongoose);
userSkeliton.plugin(findOrCreate);



const User = new mongoose.model("user",userSkeliton);

passport.use(User.createStrategy());



passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/auth/google",passport.authenticate("google",{scope:["profile"]}))

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/secrets",(req,res)=>{
    
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
            res.send("Something went wrong! Kindy retry or conatct subhranshu choudhury.")
        }else{
    res.redirect("/");

        }
    });
});

app.post("/register",(req,res)=>{
  
    User.register({username: req.body.username},req.body.password,(err,u)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    });

    
});

app.post("/login",(req,res)=>{
   const user = new User({
    username:req.body.username,
    password:req.body.password
   });

   req.login(user,(err)=>{
    if(err){
        console.log(err);
    }else{
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/secrets");
        });
    }
   });
    
});

app.listen(3000,()=>{
    console.log("===> Live at port 3000")
});