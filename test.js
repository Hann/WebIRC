var net = require('net');
var Packet = require('packet');
var fs = require('fs');

var port = 6665
  , host = 'chat.freenode.net';

var colors = {
  reset: '\033[0m',
  black: '\033[30m',
  red: '\033[31m',
  green: '\033[32m',
  yellow: '\033[33m',
  blue: '\033[34m',
  magenta: '\033[35m',
  cyan: '\033[36m',
  white: '\033[37m'
};

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
      var packet = new Packet(packets[i]);
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
});