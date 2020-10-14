const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

// users model 
const users = require('../database');

// Auth ensure function middleware
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  } 
  req.flash('error_msg','You have to login to enter.')
  res.redirect('/login')
}

// render profile
router.get('/profile',ensureAuthenticated,(req,res)=>{
  res.render('profile',{name:req.user.username})
})

// render login page
router.get('/login',(req,res)=>{
  res.render('login')
})

// render register page
router.get('/register',(req,res)=>{
    res.render('signup')
})

// Register
router.post('/register',(req,res)=>{
    const { username , password } = req.body;
    let errors = [];

    if(!username || !password){
        errors.push({msg : 'please fill up the form'})
    }

    if(password.length < 6){
        errors.push({msg:'Password must be atleast 6 characters'})
    }

    if(errors.length > 0 ){
        res.render('signup',{
            errors,
            username,
            password
        });
    } else {
        users.findOne({username:username})
          .then(user =>{
            if(user){
              errors.push({msg : 'Username already exists'});
              res.render('signup',{
                errors,
                username,
                password
              })
            } else {
              const newUser = new users({
                username,
                password
              });
      
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser
                    .save()
                    .then(user => {
                      req.flash('success_msg','You are now can Log in')
                      res.redirect('/login');
                    })
                  
                });
              });
            }
          })
          .catch(err => console.log(err));
      }
})

// Login 
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect:'/profile',
    failureRedirect:'/login',
    failureFlash:true
  })(req,res,next);
});

// Logout
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','You are logout')
  res.redirect('/login')
})  


module.exports = router;