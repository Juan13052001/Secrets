//jshint esversion:6
require("dotenv").config();
const express = require("express"),
    ejs = require("ejs"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    // md5 = require("md5"),
    // bcrypt = require("bcrypt"),
    // saltRounds = 10,
    session = require("express-session"),
    passport = require("passport"),
    passportLocalMongoose = require("passport-local-mongoose"),
    app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: "Our little secret.",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET,
//     encryptedFields: ["password"],
// });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post("/register", (req, res) => {
    User.register(
        { username: req.body.username },
        req.body.password,
        (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("secrets");
                });
            }
        }
    );
    // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash,
    //     });
    //     newUser.save((err) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render("secrets");
    //         }
    //     });
    //     // Store hash in your password DB.
    // });
});

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("secrets");
            });
        }
    });
});
// const username = req.body.username;
// const password = md5(req.body.password);

// User.findOne({ email: username }, (err, foundUser) => {
//     if (err) {
//         console.log(err);
//     } else {
//         if (foundUser) {
//             if (foundUser) {
//                 bcrypt.compare(
//                     password,
//                     foundUser.password,
//                     function (err, result) {
//                         if (result === true) {
//                         }
//                         // result == true
//                         res.render("secrets");
//                     }
//                 );
//             }
//         }
//     };
// app.get("/submit", (req, res) => {
//     res.render("submit");
// });

app.listen(3000, function () {
    console.log("Server listening on port 3000");
});
