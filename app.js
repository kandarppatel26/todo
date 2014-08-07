// mongoose setup
require( './db' );
 
var express = require('express');
var routes  = require( './routes' );
var http    = require('http');
var path    = require('path');
var app     = express();
var engine  = require('ejs-locals');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var Userinfo     = mongoose.model('Userinfo');
 
// all environments

app.set('port', process.env.PORT || 3001 );
app.engine('ejs',engine);
app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'ejs' );
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(routes.current_user);
app.use(app.router);
app.use(express.static( path.join( __dirname, 'public' )));

// development only
if( 'development' == app.get( 'env' )){
  app.use( express.errorHandler());
}
 


// Routes
app.get('/',ensureAuthenticated,routes.index);
app.post('/create',ensureAuthenticated,routes.create);
app.get('/destroy/:id',ensureAuthenticated, routes.destroy);
app.get('/edit/:id',ensureAuthenticated,routes.edit);
app.post('/update/:id',ensureAuthenticated,routes.update);

app.get('/login', function(req, res) {res.sendfile('views/login.html');});

app.get('/logout', function(req, res) {
    req.logOut();
    return res.redirect('/login')
});


app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      //req.session.messages =  info.message;
      return res.redirect('/login')
    }

    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
        Userinfo.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done) {
        process.nextTick(function() {
            Userinfo.findOne({'username': username}, function(err, user) {
                if (err) {return done(err);}
                if (!user) {return done(null, false);}
                if (user.password != password) {
                    return done(null, false);
                }

               return done(null,user);
        });
    });
}));


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

http.createServer(app).listen( app.get( 'port' ), function (){
    console.log( 'Express server listening on port ' + app.get('port'));
});