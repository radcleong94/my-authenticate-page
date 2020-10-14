require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const users = require('./database.js');
const passport = require('./passport.js');
const session = require('express-session')
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const expressLayouts = require('express-ejs-layouts');
const router = require('./routes/users');
const flash = require('connect-flash');


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/',express.static('public'));

app.use(session({ 
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.use(expressLayouts);
app.set('view engine','ejs')

app.use('/',router);

//route 404 error middleware handler
app.use((req,res,next)=>{
    res.status(404)
        .type('text')
        .send('not found')
})

app.listen(process.env.PORT || 3000,()=>{
    console.log(`connecting port ${process.env.PORT} 3.2.1...`)
});