
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');


var app = module.exports = express.createServer()
  , io = require('socket.io').listen(app); // import socket.io

var isOnVPS = true;
// var isOnVPS = false;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index); //index 
app.post('/chat', routes.chat); // chat 포스트 방식으로 받을때만, 겟으로 받을때에는 에러난다.ㅠ
app.get('/chatUI', routes.chatUI); // for ui scaffolding

io.sockets.on('connection', function (socket) {
		    socket.emit('news', { hello: 'world' });
		    socket.on('my other event', function (data) {
				      console.log(data);
				    });
		  });

app.listen((isOnVPS) ? 8080: 80, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


// start socket.io


