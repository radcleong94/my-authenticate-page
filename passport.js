
const bcrypt = require('bcrypt')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const users = require('./database')

passport.serializeUser(function(user, done) { 
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    users.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new LocalStrategy(
    function(username, password, done) {
      users.findOne({ username: username })
            .then(user => {
  
                if (!user) {
                   return done(null,false,{message:'User is not register'})
                    
                } else {
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Wrong password" });
                        }
                    });
                }
            })
            .catch(err => {
                return done(null, false, { message: err });
            });
          }
  ));


module.exports = passport;