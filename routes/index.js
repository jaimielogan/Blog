var express = require('express');
var router = express.Router();
var passport = require('../passport');
var query = require('../queries.js');

// Home Page //
//-----------//
// Get Blogs //
router.get('/', function(req, res, next) {
  query.getBlogs()
  .then(function(blogData){
    res.render('index', {blogs: blogData});
  });
});

// Register //
//-----------//
// Render Register Page //
router.get('/register', function(req,res,next){
  res.render('register');
});

// Post - Register Information //
router.post('/register', function(req,res,next){
  query.add(req.body.username, req.body.password,req.body.fullName)
  .then(function(){
    res.redirect('/login');
  })
  .catch(function(err){
    res.render('error', {message: "This username is already in use.", link: '/register'});
    return;
  });
});

// Login //
//--------//
// Render Login Page //
router.get('/login', function(req,res,next){
  res.render('login');
});

// Post - Login Information //
router.post('/login', passport.authenticate('local', {
  successRedirect: '/post',
  failureRedirect: '/login'
}));

//---------------//
// Logout //
router.get('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
});

// Post Article //
//--------------//
// Render Post Article Page//
router.get('/post', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  res.render('post', {user: req.user});
});

// Post - Post Article//
router.post('/post', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  query.findUserInformation(req.user.username)
  .then(function(userInfo){
    query.createPost(req.body.title,req.body.content,req.body.image,userInfo.id,userInfo.fullName)
    .then(function(){
      res.redirect('/');
    });
  });
});

//---------------//
// Get One Blog //
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

//----------------------------//
// Create Comment On One Blog //
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

// Edit One Blog //
//---------------//
// Render the Edit Page for particular blog //
router.get('/:blogid/editPost', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.findUserInformation(req.user.username)
  .then(function(userInfo){
    query.getBlogByID(req.params.blogid)
    .then(function(blogInfo){
      if(userInfo.id !== blogInfo[0].user_id){
        res.render('error', {message: "This is not your blog post. You do not have access to edit.", link: url});
        return;
      }
      res.render('edit', {blogInfo: blogInfo});
    });
  });
});

// Edit One Blog //
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

//------------------//
// Delete One Blog //
router.get('/:blogid/deletePost', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.findUserInformation(req.user.username)
  .then(function(userInfo){
    query.getBlogByID(req.params.blogid)
    .then(function(blogInfo){
      if(userInfo.id !== blogInfo[0].user_id){
        res.render('error', {message: "This is not your blog post. You do not have access to edit.", link: url});
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
  });
});

// Edit One Comment on One Blog //
//-------------------------------//
// Render Edit Page for One Comment on One Blog //
router.get('/:blogid/:commentid/editComment', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.findUserInformation(req.user.username)
  .then(function(userInfo){
    query.getBlogByID(req.params.blogid)
    .then(function(blogInfo){
      query.getCommentsByID(req.params.commentid)
      .then(function(commentById){
        if(userInfo.id !== commentById[0].user_id){
          res.render('error', {message: "This is not your comment. You do not have access to edit.", link: url});
          return;
        }
        res.render('comment', {blogInfo: blogInfo, commentById: commentById});
      });
    });
  });
});

// Post - Edit One Comment on One Blog //
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

//---------------------------------//
// Delete One Comment on One Blog //
router.get('/:blogid/:commentid/deleteComment', function(req,res,next){
  if(!req.isAuthenticated()){
    res.redirect('/login');
    return;
  }
  var url = '/' + req.params.blogid;
  query.findUserInformation(req.user.username)
  .then(function(userInfo){
    query.getCommentsByID(req.params.commentid)
    .then(function(commentById){
      if(userInfo.id !== commentById[0].user_id){
        res.render('error', {message: "This is not your comment. You do not have access to delete.", link: url});
        return;
      }
      query.deleteComment(req.params.commentid)
      .then(function(){
        res.redirect(url);
      });
    });
  });
});

module.exports = router;
