
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app); // import socket.io

var net = require('net');
var process = require('process');

var Message = require('./irc_packet').Message;

// utilities
var format = require('./formatter.js').format; // this module also add format method to String's prototype
var colorize = require('./colorizer.js').colorize;

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
app.post('/chat', routes.chat); // it only takes POST verb. if someone access to this by GET, the error will be raised
app.get('/chatUI', routes.chatUI); // for ui scaffolding
app.get('/test', routes.test); // for testing

/*
  TO DOs

  1.
  /home/hyeon0135/WebIRC/app.js:61
      socket.emit('ready', socket.handshake.address.address);
                                           ^
  TypeError: Cannot read property 'address' of undefined
      at Socket.<anonymous> (/home/hyeon0135/WebIRC/app.js:61:42)
      at Socket.emit (events.js:64:17)
      at Object.afterConnect [as oncomplete] (net.js:652:10)

  2.
  <ERROR DUMP>--------------------------------------------------------------------
  { [Error: connect ETIMEDOUT] code: 'ETIMEDOUT', errno: 'ETIMEDOUT', syscall: 'connect' }
  -------------------------------------------------------------------</ERROR DUMP>

  3.
  Reduce the quantity of logs
*/

// is it better to make object to store below configures?
var IRC_SERVER_HOST = 'chat.freenode.net';
var IRC_SERVER_PORT = 6665;

io.configure('production', function () {
  io.set('log level', 1); // reduce logging
});

io.sockets.on('connection', function (socket) {
  console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));
  console.log(colorize('-><blue>{socket.io:} connected'));

  var client = net.connect(IRC_SERVER_PORT, IRC_SERVER_HOST);
  client.setEncoding('utf8');
  
  client.on('connect', function () {
    console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));

    socket.emit('ready', socket.handshake.address.address);
    console.log(colorize('-><blue>{socket.io:} \'ready\' emitted'));

    // AFTER CLIENT's CONNECTION, set socket.io handlers
    socket.on('relay', function (message) {
      console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));
      console.log(colorize('-><blue>{socket.io:} relaying'));

      client.write(message);
      console.log(colorize('-><green>{client:} <magenta>{%s} written'.format(message.substr(0, message.length - 2).replace('}', '\\}'))));
    });

    socket.on('disconnect', function () {
      console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));
      console.log(colorize('-><blue>{socket.io:} disconnected'));

      // merge them
      client.write(new Message('QUIT', 'see you later').build()); /// maybe.. it's client's part.. but.. I CANNOT implement in client-side!! how can i catch 'the unload' of browser?
      client.end();

      console.log(colorize('-><green>{client:} QUIT message written'));
    });
  });
  
  // what a beautiful depth =_= 
  // maybe it is better to remove the callback structure
  socket.set('repository', '', function () {  // 1. initialize repository
    client.on('data', function (data) { // 2. set 'data' handler
      console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));
      console.log(colorize('-><green>{client:} some data received'));

      socket.get('repository', function (error, repository) { // 2. get repository
        repository += data; // 3. merge repository and new data

        var messages = repository.split('\r\n');
        socket.set('repository', messages.pop(), function () {  // 4. store remains in repository
          for (var i = 0, length = messages.length; i < length; i++) {
            socket.emit('relay', messages[i]); // 5. EMIT EMIT EMIT!!
          }
        });
      });

      console.log(colorize('-><blue>{socket.io:} some data emitted'));
    });
  });

  client.on('error', function (error) {
    console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));
    console.log(colorize('-><green>{client:} error occurred'));
    console.log(colorize('\n<red>{<ERROR DUMP>--------------------------------------------------------------------}'));
    console.log(error);
    console.log(colorize('<red>{-------------------------------------------------------------------</ERROR DUMP>}\n'));

    socket.emit('error', 'An error is occurred');
    console.log(colorize('-><blue>{socket.io:} error emitted'));
  });

  client.on('close', function (hadError) {
    console.log(colorize('\n<yellow>{#%s}'.format(socket.id)));
    console.log(colorize('-><green>{client:} closed'));
  });
});

app.listen(1234, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
