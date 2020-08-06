const express = require('express');
const userRouter = express.Router();
const crypto = require('crypto');

const User = require('../models/users.js');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

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
        }
    }));  
});

userRouter.post('/login', (req, res) => {

    User.findOne({ username: req.body.username }, function(err, user) {

        if (user != null && user.password === getHashedPassword(req.body.password)) {

            const authToken = generateAuthToken();
            res.cookie('AuthToken', authToken);
            res.redirect('/smartini');
        } else {
            console.log('User not found.');
            res.redirect('/register');
        }
    });
})

module.exports = userRouter;