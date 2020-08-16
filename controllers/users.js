const express = require('express');
const userRouter = express.Router();
const crypto = require('crypto');

const User = require('../models/users.js');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}
// Middleware
const isAuthenticated = (req, res, next) => {

    const authToken = req.cookies['AuthToken'];
    req.user = authToken === "" ? null : authToken;

    return next();
  }
  

userRouter.get('/login', isAuthenticated, (req, res)  => {
    res.render('login/login', { isNotLoggedIn : req.user == null })
})

userRouter.get('/create', isAuthenticated, (req, res)  => {
    res.render('login/sign-up', { isNotLoggedIn : req.user == null })
})

// create new user
userRouter.post('/register', (req, res) => {
    // Hash the password before putting it in the database
    req.body.password = getHashedPassword(req.body.password);
    if (User.findOne({ username: req.body.username }, function(err, user) {

        if (user == null) {
            User.create(req.body, (err, createdUser) => {
                console.log('user is created', createdUser);
                res.redirect('/smartini');
            });
        } else {
            res.redirect('/create');
        }
    }));  
});

userRouter.post('/login', (req, res) => {

    User.findOne({ username: req.body.username }, function(err, user) {

        if (user != null && user.password === getHashedPassword(req.body.password)) {

            res.cookie('AuthToken', req.body.username);
            res.redirect('/smartini');
            console.log('logged in');
        } else {
            console.log('User not found.');
            res.redirect('/users/create');
        }
    });
})

userRouter.get('/logout', (req, res) => {
    res.cookie('AuthToken', "");
    res.redirect('/smartini');

}) 


module.exports = userRouter;