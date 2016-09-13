var express = require('express');
var router = express.Router();
var passport = require('../passport');
var query = require('../queries.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  query.getBlogs()
  .then(function(blogData){
    res.render('index', {blogs: blogData});
  });
});

router.get('/register', function(req,res,next){
  res.render('register');
});

router.post('/register', function(req,res,next){
  query.add(req.body.username, req.body.password,req.body.fullName)
  .then(function(){
    res.redirect('/login');
  })
  .catch(function(err){
    return next(err);
  });
});

router.get('/login', function(req,res,next){
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/post',
  failureRedirect: '/login'
})
);

router.get('/post', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  res.render('post', {user: req.user});
});


router.post('/post', function(req,res,next){
  query.createPost(req.body.title,req.body.content,req.body.image)
  .then(
    res.redirect('/')
  );
});

router.get('/:blogid', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  query.getBlogByID(req.params.blogid)
  .then(function(blogInfo){
    query.getComments(req.params.blogid)
    .then(function(comments){
      res.render('blog',{blog_id:req.params.blogid,blogInfo:blogInfo,comments:comments});
    });
  });
});

router.post('/:blogid', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  query.findUserInformation(req.user.username)
  .then(function(userInfo){
    query.createComment(userInfo.id,req.params.blogid,req.body.comment,userInfo.fullName)
    .then(
      res.redirect(url)
    );
  });
});

router.get('/:blogid/editPost', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  query.getBlogByID(req.params.blogid)
  .then(function(blogInfo){
    res.render('edit', {blogInfo: blogInfo});
  });
});

router.post('/:blogid/editPost', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.editBlogPost(req.params.blogid,req.body.title,req.body.content,req.body.image)
  .then(function(){
    res.redirect(url);
  });
});

router.get('/:blogid/deletePost', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  query.deleteComments(req.params.blogid)
  .then(function(){
    query.deleteBlogPost(req.params.blogid)
    .then(function(){
      res.redirect('/');
    });
  });
});

router.get('/:blogid/:commentid/editComment', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  query.getBlogByID(req.params.blogid)
  .then(function(blogInfo){
    query.getCommentsByID(req.params.commentid)
      .then(function(commentById){
        res.render('comment', {blogInfo: blogInfo, commentById: commentById});
      });
  });
});

router.post('/:blogid/:commentid/editComment', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.editComment(req.params.commentid,req.body.commentEdit)
  .then(function(){
    res.redirect(url);
  });
});


router.get('/:blogid/:commentid/deleteComment', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.deleteComment(req.params.commentid)
  .then(function(){
    res.redirect(url);
  });
});

router.get('/logout', function(req,res){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  req.logout();
  res.redirect('/');
});

module.exports = router;
