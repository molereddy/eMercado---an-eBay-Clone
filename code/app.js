
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser');

const adminRo = require('./routes/admin');
// const otherRo = require('./routes/other');
const pool =  require('./utils/database');
 

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,'public')));

app.use(cookieParser('secretString'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());



app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});





app.use('/',adminRo);
// app.use('/',otherRo);


app.listen(3000);