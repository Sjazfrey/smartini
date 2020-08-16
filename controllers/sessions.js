const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const sessionRouter = express.Router();


sessionRouter.get('/new', (req, res) => {
    res.render('sessions/new.ejs', {
        currentUser: req.session.currentUser
    });
});

sessionRouter.post('/', (req, res) => {
    // Look for a user with the requested username
    User.findOne({ username: req.body.username }, (err, foundUser) => {
        if (!foundUser) {
            // Let the client know if no user exists with that username
            res.send('<a href="/smartini/">Sorry, user not found.</a>');
        } else {
            // Check the found user's password agains input password
            if (bcrypt.compareSync(req.body.password, foundUser.password)) {
                // If correct, set the session information
                req.session.currentUser = foundUser;
                res.redirect('/smartini');
            } else {
                // Let the client know if the password was incorrect
                res.send('<a href="/smartini">Incorrect password.</a>');
            }
        }
    });
});

sessionRouter.delete('/', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/smartini');
    });
});

module.exports = sessionRouter;