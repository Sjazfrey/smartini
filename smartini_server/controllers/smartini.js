const express = require('express');
const router = express.Router();

const Smartini = require('../models/smartini.js');

const isAuthenticated = (req, res, next) => {

  const authToken = req.cookies['AuthToken'];
  req.user = authToken;

  if (req.user) {
    return next();
  } else {
    res.redirect('/sessions/new');
  }
}

// ROUTES
// index
router.get('/', (req, res)=>{
  res.render('game/home',{})
})

router.get('/random', (req, res)=>{
  res.render('game/random',{})
})

router.get('/create', (req, res)=>{
  res.render('game/create',{})
})

router.get('/play', (req, res)=>{
  res.render('game/play',{})
})



// new
router.get('/new', isAuthenticated, (req, res) => {
  
})

// post
router.post('/', isAuthenticated, (req, res)=>{
  if(req.body.newQuestion === 'on'){ //if checked, req.body.readyToEat is set to 'on'
    req.body.newQuestion = true;
  } else { //if not checked, req.body.readyToEat is undefined
    req.body.newQuestion = false;
  }
  Smartini.create(req.body, (error, createdSmartini)=>{
    res.redirect('/smartini');
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