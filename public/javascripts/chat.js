$(document).ready(function () {
var input = $('message');
var Message = IRCPacket.Message;
var Prefix = IRCPacket.Prefix;
var socket = io.connect('http://hann.iptime.org');
var time = $('#time');
var log = $('#log');

function appendlog(message){
    log.append("<p>" + message + "<p>");
    time.append("<p>" + (new Date().toLocaleTimeString()) + "</p>");
}

function emit(message){
    socket.emit('relay', message);
}

socket.on('ready', function(ip){
	      var message = new Message('NICK' , nickname).build();
	      emit(message);
	      message = new Message('USER', nickname, ip, 'chat.freenode.net', nickname).build();
	      emit(message);
	      appendLog(message);

	  });

socket.on('relay', function(message){
	     appendLog(message); 
	  });

		      
$(function(){
      $(window).resize(function(){
			   width = parseInt($(this).width());
			   height = parseInt($(this).height());
			   $('#chat-container').height(height-140);
			   $('#chat-container').width(width-140);
		       }).resize();
  });

// use jQuery.
input.keyup(function (event){
    if (event.which == 13){
	var message = input.val();
	console.log(message);
	if (message != ''){
	    var cr = new CommandReader();
	    var data = cr.parseText(message);
	    if (data.command == "PRIVMSG"){
		var log = "<p>"+ nickname + " : " +  data.parameters +"</p>";
		var time = "<p>" + (new Date().toLocaleTimeString()) + "</p>";
		$('#log').append(log);
		$('#time').append(time);
		emit(data.command, data.meters);
	    }

	    input.val('');
	    $('#chat-container').scrollTop(height);
	}
    }
    
});
});
