
/**
 * Module dependencies.
 */

var express = require('express')
	,	faye = require('faye')
	, fs = require('fs')
	, sys = require('sys')
	, nib = require('nib')
	, stylus = require('stylus')
	, sio = require('socket.io');
	
faye.Logging.logLevel = 'info'; 

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(stylus.middleware({ 
      src: __dirname + '/public'
    , compile: compile }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
  function compile (str, path) {
  		return stylus(str)
  			.set('filename', path)
  			.use(nib());
  }
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

/*******************************************
 * Faye
 ******************************************/
var bayeux = new faye.NodeAdapter({
		mount: '/bayeux'
	,	timeout: 130
});

bayeux.attach(app);

/*******************************************
 * Auth
 ******************************************/
var collections = [];
var serverAuth = {
  incoming: function(message, callback) {
    if (message.channel !== '/meta/subscribe') {
      return callback(message);	
		}
		
		console.log('-------------incoming start----------------');
		console.log(message);
    callback(message);
		console.log('-------------incoming end----------------');
  },

	outgoing: function (message, callback) {
		console.log('-------------outgoing start----------------');
		console.log(message);
		callback(message);
		console.log('-------------outgoing end----------------');		
	}
};

bayeux.addExtension(serverAuth);

sys.puts('Listening on : ' + bayeux);


/*******************************************
 * Routes
 ******************************************/

// for (var item in bayeux) {
//   collections.push(item);
// };

app.get('/', function(req, res){
  res.render('index', {
      title: 'Faye Chatter'
  });
});

app.get('/dashboard', function(req, res) {
	res.render('dashboard/index');
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
