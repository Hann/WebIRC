var net = require('net');
var IRCPacket = require('./irc_packet');
var fs = require('fs');

var port = 6665;
var host = 'chat.freenode.net';

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


setTimeout(function () {

var client = net.connect(port, host);
client.setEncoding('utf8');

client.on('connect', function () {
  console.log(colorize('<yellow>{message:} connected to server'));
  client.write(new IRCPacket('NICK', 'NodePacket').build());
  client.write(new IRCPacket('USER', 'NodePacket', 'NodePacket', 'chat.freenode.net', 'NodePacket').build());
  console.log(colorize('<yellow>{message:} NICK and USER sent\n'));
});


var repository = '';
client.on('data', function (data) {
  repository += data;

  var rawPackets = repository.split('\r\n');
  repository = rawPackets.pop();

  for (var i = 0; i < rawPackets.length; i++) {
    console.log(colorize('<cyan>{packet:} ' + rawPackets[i]));
    
    try {
      var packet = new IRCPacket().parse(rawPackets[i]);
      if (packet.hasOwnProperty('prefix')) {
        if (packet.prefix.type === 1) {
          console.log(colorize('<magenta>{prefix-type-1:} ' + packet.prefix.serverName));
        } else {
          var temporaryValue = packet.prefix.nickname;
          if (packet.prefix.hasOwnProperty('user')) temporaryValue += '  /  ' + packet.prefix.user;
          if (packet.prefix.hasOwnProperty('host')) temporaryValue += '  /  ' + packet.prefix.host;
          console.log(colorize('<magenta>{prefix-type-2:} ' + temporaryValue));
        }
      } else {
          console.log(colorize('<magenta>{no-prefix}'));
      }

      console.log(colorize('<blue>{command:} ' + packet.command));
      if (packet.command === 'PING') {
        client.write(new IRCPacket('PONG', packet.parameters[0]).build());
      } else if (packet.command === '376') {
        client.write(new IRCPacket('JOIN', '#node.js').build());
        client.write(new IRCPacket('JOIN', '#ubuntu').build()); 
        client.write(new IRCPacket('JOIN', '#debian').build());
        client.write(new IRCPacket('JOIN', '#python').build());
      }

      console.log(colorize('<magenta>{parameters:} [' + packet.parameters.join(', ') + ']'));

    } catch (exception) {
      console.log(colorize('<red>{error:} ' + exception.toString()));
      fs.createWriteStream('logs.txt', { flags: 'a'}).write('packet: ' + rawPackets[i] + '\n' + ' -> ' + exception.toString() + '\n');
    }

    console.log('');
  }
});
}, 0);

/*
var client = net.connect(port, host, function () {
  console.log('client connected');

  client.write('NICK NodePacket\r\n');
  client.write('USER NodePacket NodePacket chat.freenode.net NodePacket\r\n');
  console.log('USER and USER sent');
});
client.setEncoding('utf8');

var repository = '';
client.on('data', function (data) {
  repository += data;
  
  var packets = repository.split('\r\n');
  repository = packets.pop();
  
  for (var i = 0; i < packets.length; i++) {
    console.log(colors.cyan + 'packet' + colors.reset + ' :: ' + packets[i]);
    
    try {
      var packet = new IRCPacket(packets[i]);
      if (packet.prefix) {
        if (packet.prefix.type === 1) {
          console.log(colors.blue + 'parsed prefix-type-1' + colors.reset + ' :: ' + packet.prefix.serverName);
        } else {
          console.log(colors.blue + 'parsed prefix-type-2' + colors.reset + ' :: ' + packet.prefix.nickname + ' / ' + packet.prefix.user + ' / ' + packet.prefix.host);
        }
      }
      console.log(colors.green + 'parsed command' + colors.reset + ' :: ' + packet.command );
      console.log(colors.magenta + 'parsed parameters' + colors.reset + ' :: ' + packet.parameters);
      
      if (packet.command === "PING") {
        client.write('PONG ' + packet.parameters[0] + '\r\n');
      } else if (packet.command === "376") {
        client.write('JOIN #node.js\r\n')
      }
      
    } catch (exception) {
      fs.createWriteStream('logs.txt', { flags: 'a'}).write('packet: ' + packets[i] + '\n' + ' -> ' + exception.toString() + '\n');
      console.error(colors.red + 'failed to parse ' + colors.reset + ' :: ' + exception.toString());
    }
    
    console.log('\n\n');
  }
});*/