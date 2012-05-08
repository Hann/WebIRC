var Message = IRCPacket.Message;
var Prefix = IRCPacket.Prefix;
var socket = io.connect('http://hann.iptime.org');
var time = $('#time');
var log = $('#log');

function appendlog(message){
    log.append("<p>" + message + "<p>");
    time.append("<p>" + (new Date().toLocaleTimeString()) + "</p>");
}

socket.on('ready', function(ip){
	      var message = new Message('NICK' , nickname).build();
	      socket.emit('relay', message);
	      message = new Message('USER', nickname, ip, 'chat.freenode.net', nickname).build();
	      socket.emit('relay', message);
	      appendLog(message);
	  });

