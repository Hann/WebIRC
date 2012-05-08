
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app); // import socket.io

var net = require('net');

var Message = require('./irc_packet').Message;

var IRC_SERVER_HOST = 'chat.freenode.net';
var IRC_SERVER_PORT = 6665;

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
app.get('/test', routes.test); // for testing

var Colorizer = {
  pattern: /<(reset|black|red|green|yellow|blue|magenta|cyan|white)>{(.*?[^\\]?)}/g,
  colors: {
    reset: '\033[0m',
    black: '\033[30m',
    red: '\033[31m',
    green: '\033[32m',
    yellow: '\033[33m',
    blue: '\033[34m',
    magenta: '\033[35m',
    cyan: '\033[36m',
    white: '\033[37m'
  },

  colorize: function (text) {
    var output = text.replace(Colorizer.pattern, function (substring, color, text) {
      return Colorizer.colors[color] + text + Colorizer.colors['reset'];
    });

    return output.replace(/\\([{}])/g, '$1');
  }
};
var colorize = Colorizer.colorize;

io.sockets.on('connection', function (socket) {
  console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<blue>{message:} ' + 'connected'));

  // EDIT: handling when connection fails
  var client = net.connect(IRC_SERVER_PORT, IRC_SERVER_HOST);
  client.setEncoding('utf8');
   
  client.on('connect', function () {
    console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<green>{message:} ' + 'connected'));
    socket.emit('ready', socket.connection.remoteAddress);
    console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<blue>{message:} ' + "'initialized' emitted"));
  });
  
  // relay: from server to client
  socket.set('repository', '', function () { // 1. initialize repository
    console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<blue>{message:} ' + 'repository initialized'));
    client.on('data', function (data) { // 2. set data listener
      console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<green>{message:} ' + 'messages received'));
      socket.get('repository', function (err, repository) { // 3. get repository
        repository += data;
        
        var messages = repository.split('\r\n');
        socket.set('repository', messages.pop(), function () { // 4. set remains in repository
          for (var i = 0, length = messages.length; i < length; i++) { // 5. send messages
            // PING is processed on relay server
            if (messages[i].match(/PING/i) !== null) { 
              var message = new Message().parse(messages[i]);
              if (message.command === 'PING') { 
                message.command = 'PONG';
                client.write(message.build());
                console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<green>{message:} ping-pong'));
                
                continue ;
              }
            }

            socket.emit('relay', messages[i]);
            console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<blue>{message:} ' + 'message emitted\r\n' + '<yellow>{contents:} ' + messages[i]));
          }
        });
      });
    });

  });
  
  // relay: from client to server
  socket.on('relay', function (message) {
    if (message.substr(-2) !== '\r\n') message += '\r\n';
    client.write(message);
    console.log(colorize('<magenta>{#' + socket.id + '}\r\n' + '<green>{message:} ' + 'message written\r\n<yellow>{contents:} ' + message.substr(0, message.length - 2)));
  });

  socket.set('client', client);
});

app.listen(1234, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
