var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Breath of Fresh Air' });
});

router.get('/register', function(req,res,next){
  res.render('register');
});

router.post('/register', function(req,res,next){
  console.log("Post Reached");
});

router.get('/login', function(req,res,next){
  res.render('login');
});

router.post('/login', function(req,res,next){
  console.log("Login Reached");
});

router.get('/post', function(req,res,next){
  res.render('post');
});

router.post('/post', function(req,res,next){
  console.log("Blog Post Reached");
});

module.exports = router;
