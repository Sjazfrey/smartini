const express = require('express');
// const app = express()
const router = express.Router();
const axios = require('axios');
const sync_request = require('sync-request');
const decode = require('unescape');

const Smartini = require('../models/smartini.js');

// Middleware
const isAuthenticated = (req, res, next) => {

  const authToken = req.cookies['AuthToken'];
  req.user = authToken === "" ? null : authToken;

  return next();
}

// ROUTES
// index
router.get('/', isAuthenticated, (req, res)=>{
  console.log(req.user);
  res.render('game/home', { isNotLoggedIn : req.user == null })
})

router.get('/random', isAuthenticated, (req, res)=>{
  res.render('game/random',{ isNotLoggedIn : req.user == null })
})

router.get('/create', isAuthenticated, (req, res)=>{
  res.render('game/create',{ isNotLoggedIn : req.user == null })
})

router.post('/play', isAuthenticated, (req, res)=>{
  console.log(req.body);
  //render myquestion button info on random page
  if (req.body.questionType === 'random') {
    //generate code
    let gameCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    let questionAndAnswer = getNumberOfRandomQuestions(req.body.numberOfQuestions, req.body.category);
    //generate code
    res.render('game/play', { qna : questionAndAnswer, maxQuestions : req.body.numberOfQuestions, isNotLoggedIn : req.user == null, roomCode : gameCode })
  } else if (req.body.questionType === 'mine') {
    getNumberOfMyQuestions(res, req, req.body.numberOfQuestions);
  }
})

function getNumberOfMyQuestions(res, req, number) {

  let questions = [];

  // https://stackoverflow.com/questions/39277670/how-to-find-random-record-in-mongoose?answertab=votes#tab-top
  Smartini.count().exec(function (err, count) {
  
    for (let i = 0; i < number; i++) {

      // Get a random entry
      let random = Math.floor(Math.random() * count)
      // Again query all users but only fetch one offset by our random #
      Smartini.findOne().skip(random).exec(
        function (err, result) {
          questions.push({ question : result.question, answer : result.answer});
        })
    }

    let gameCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    res.render('game/play', { qna : questions, maxQuestions : number, isNotLoggedIn : req.user == null, roomCode : gameCode })
  })
}

function getNumberOfRandomQuestions(number, category) {

  let questions = [];

  let url = 'https://opentdb.com/api.php?type=multiple&amount=' + number;

  if (category > 0) {
    url = url + '&category=' + category;
  }

  let response = sync_request('GET', url);

  let jsonResponse = JSON.parse(JSON.stringify(JSON.parse(response.getBody())));

  for (let i = 0; i < jsonResponse.results.length; i++) {
    // console.log(jsonResponse.results[i].question);
    let decodedQuestion = decode(jsonResponse.results[i].question.toString(), 'all');
    decodedQuestion = decodedQuestion.replace(/&#039;/g, "'");

    let decodedAnswer = decode(jsonResponse.results[i].correct_answer.toString(), 'all');
    decodedAnswer = decodedAnswer.replace(/&#039;/g, "'");
    questions.push({ question : decodedQuestion, answer : decodedAnswer });
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