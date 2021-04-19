
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const adminRo = require('./routes/admin');
// const otherRo = require('./routes/other');
const pool =  require('./utils/database');
 

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,'public')));


app.use('/',adminRo);
// app.use('/',otherRo);

app.listen(3000);