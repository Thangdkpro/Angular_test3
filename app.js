var express = require('express');
var app = express();
var session = require('express-session');
var mongoose     = require('mongoose');
var flash    = require('connect-flash');
var validator = require('express-validator');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');

app.use(express.static("public"));

var configDB = require('./config/database.js');
mongoose.connect(configDB.url)

//test:
const validatorOptions = {
  customValidators: {
      greaterThanOrEqual: (inputParam, minValue) => {
          return inputParam > minValue;
      }
  }
};
app.use(validator(validatorOptions));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views engine', 'ejs')

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); 
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); 

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}))
// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); 

app.use(flash());
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.messages = req.flash('messages');
  next();
})



require('./routes/index.js')(app,passport)

require('./routes/user.js')(app,passport)








app.listen(4200);
