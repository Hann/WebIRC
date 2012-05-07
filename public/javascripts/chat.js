var socket = io.connect('http://hann.iptime.org');
var sessionId;
var width;
var height;


$(function(){
      $(window).resize(function(){
			   width = parseInt($(this).width());
			   height = parseInt($(this).height());
			   $('#chat-container').height(height-140);
			   $('#chat-container').width(width-140);
		       }).resize();
  });


function fromClient(message){    
//    socket.emit('fromClient' , { command : message.command , parameters : message.parameters}, sessionId);
    var irc = new IRCClient(message);;
    var packet = irc.toYou();
    socket.emit('fromClient' , packet);
    console.log(message.command, message.parameters);
}

function enterKeyEvent(event){
    if (event.keyCode == 13){
	var message = $('#message').val();
	if (message != ''){
	    var cr = new CommandReader();
	    var data = cr.parseText(message);
	    if (data.command == "PRIVMSG"){
		var log = "<p>"+ nickname + " : " +  data.parameters +"</p>";
		var time = "<p>" + (new Date().toLocaleTimeString()) + "</p>";
		$('#log').append(log);
		$('#time').append(time);
	    }
//	    console.log(parsedData);
	    fromClient(data);
	    $('#message').val('');
	    $('#chat-container').scrollTop(height);
	}
    }
}

socket.on('contact', function(data , id){	      
	      sessionId = id;
	      fromClient({command : nickname , parameters : channel });
	      console.log(nickname);
	      console.log(id);
	  });
