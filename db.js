var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
 
var Todo = new Schema({
    user_id    : String,
    content    : String,
    updated_at : Date
});


var Userinfo = new Schema({
    username    : String,
    password    : String
});

mongoose.model('Todo', Todo);
mongoose.model('Userinfo',Userinfo);
mongoose.connect( 'mongodb://localhost/express-todo');