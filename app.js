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
const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');

const URI = process.env.MONGO_URI;
const store = new MongoStore({url:URI});


app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(nocache());
app.use(helmet.hidePoweredBy({setTo: 'PHP 4.2.0'}));
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      return next();
    } 
    req.flash('error_msg','You have to login to enter.')
    res.redirect('/login')
  }


app.use(session({ 
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized:true,
    key:'express.sid',
    store:store
}));
app.use(passport.initialize());
app.use(passport.session());

io.use(passportSocketIo.authorize({
    cookieParser:cookieParser,
    key:'express.sid',
    secret:process.env.SECRET,
    store:store,
    success:onAuthorizeSuccess,
    fail:onAuthorizeFail
}))

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


let currentUsers = 0;
io.on('connection',socket=>{
    ++currentUsers;

    io.emit('user',{
        name:socket.request.user.username,
        currentUsers,
        connected:true
    })

    socket.on('chat message',(message)=>{
        io.emit('chat message',{
            name:socket.request.user.username,
            message
        })
    })

    socket.on('disconnect',()=>{
        console.log('A user has disconnected')
        --currentUsers;
        io.emit('user',{
            name:socket.request.user.username,
            currentUsers,
            connected:false
        })
    })
})

function onAuthorizeSuccess(data,accept){
    console.log('successful connect to socket.io')
    accept(null,true);
}
function onAuthorizeFail(data,message,error,accept){
    if (error) throw new Error(message)
    console.log('fail to connect to socket.io',message)
    accept(null,false);
}


//route 404 error middleware handler
app.use((req,res,next)=>{
    res.status(404)
        .type('text')
        .send('not found')
})

http.listen(process.env.PORT || 3000,()=>{
    console.log(`connecting port ${process.env.PORT} 3.2.1...`)
});