const express = require('express');
// const app = express()
const router = express.Router();
const axios = require('axios');
const sync_request = require('sync-request');

const Smartini = require('../models/smartini.js');

const isAuthenticated = (req, res, next) => {

  const authToken = req.cookies['AuthToken'];
  req.user = authToken;

  // Executeif (req.user) {
    return next();
  //} else {
    //res.redirect('/sessions/new');
  //}
}

// ROUTES
// index
router.get('/', isAuthenticated, (req, res)=>{
  console.log(req.user);
  res.render('game/home', { isNotLoggedIn : req.user == null })
})

router.get('/random', (req, res)=>{
  res.render('game/random',{})
})

router.get('/create', (req, res)=>{
  res.render('game/create',{})
})

router.get('/play', (req, res)=>{
  res.render('game/play',{})
  console.log(getNumberOfRandomQuestions(10));
})

function getNumberOfRandomQuestions(number) {

  let questions = [];

  for (let i = 0; i < number; i++) {

    let response = sync_request('GET', 'https://jservice.io/api/random');
    let jsonResponse = JSON.parse(response.getBody())[0];
    questions.push({ question : jsonResponse.question, answer : jsonResponse.answer});
  }

  return questions;
}

// new
router.get('/new', isAuthenticated, (req, res) => {
  
})

// post
router.post('/new', isAuthenticated, (req, res)=>{

  Smartini.create(req.body, (error, createdSmartini)=>{
    res.render('game/create', { successful: true })
  })
})

// edit
router.get('/:id/edit', isAuthenticated, (req, res)=>{
  Smartini.findById(req.params.id, (err, foundSmartini)=>{ //find the 
      res.render('edit.ejs', {
        smartini: foundSmartini, //pass in found 
        currentUser: req.session.currentUser
      })
  })
})

// update
router.put('/:id', isAuthenticated, (req, res)=>{
  if(req.body.newQuestion === 'on'){
      req.body.newQuestion = true;
  } else {
      req.body.newQuestion = false;
  }
  Smartini.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, updatedModel)=> {
    res.redirect('/smartini');
  })
})

// show
router.get('/:id', isAuthenticated, (req, res) =>{
  Smartini.findById(req.params.id, (err, foundSmartini)=>{
    
  })
})

// delete
router.delete('/:id', isAuthenticated, (req, res) => {
  Smartini.findByIdAndRemove(req.params.id, { useFindAndModify: false }, (err, data)=>{
    res.redirect('/smartini') //redirect back to index
  })
})

module.exports = router;