
// database connection
const mongoose = require('mongoose');
let uri = 'mongodb+srv://radcleong94:'+ process.env.PW +'@clusterdb01.x0ndl.mongodb.net/EcommerceApp?retryWrites=true&w=majority';

mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology: true})
.then(()=>{
    console.log('connected to database ..')
})
.catch((err)=>{
    console.log('failed to connect database...')
})


// create schema
const userInfo = mongoose.Schema({
    username:{type:String , required:true},
    password:{type:String , required:true}
})

// create model collection
const users = mongoose.model('users',userInfo);

module.exports = users;