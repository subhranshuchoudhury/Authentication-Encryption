require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin_subhranshu:test123@cluster0.one0j.mongodb.net/secretsApp");

const userSkeliton = new mongoose.Schema({
    email: String,
    password: String
}); // schema


userSkeliton.plugin(encrypt,{secret:process.env.SECRET_KEY, encryptedFields:["password"]});

const User = new mongoose.model("user",userSkeliton);

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err)=>{
        if(err){
            res.send(err);
        }else{
            res.render("secrets");
        }

    });
});

app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username},(err,userFound)=>{
        if(err){
            res.send(err);
        }else{
            if(userFound){
                if(userFound.password === password){
                    res.render("secrets");
                }else{
                    res.send("Wrong UserID/Password!");
                }
            }
        }
    });
});

app.listen(3000,()=>{
    console.log("===> Live at port 3000")
});