var socket = io.connect('http://hann.iptime.org');
var sessionId;

function fromClient(message){    
    socket.emit('fromClient' , { command : message.command , parameters : message.parameters}, sessionId);
    console.log(message.command, message.parameters);
}

function enterKeyEvent(event){
    if (event.keyCode == 13){
	var message = $('#message').val();
	if (message != ''){
	    var cr = new CommandReader();
	    var parsedData = cr.parseText(message);
	    if (!(parsedData.command in cr.commandList)){
		$('#log').append("<p><font color ='" + parsedData.color + "' >" + parsedData.parameters + "</font></p>");
		$('#time').append("<p><font color ='" + parsedData.color + "'>" + (new Date().toLocaleTimeString()) + "</font></p>");
	    }
	    else {
		if (parsedData.command == 'MSG'){
		    parsedData.command = "PRIVMSG";
		}
	    }
	    console.log(parsedData);
	    fromClient(parsedData);
	    $('#message').val('');
	    $('body').scrollTop(100000000000000000);
	}
    }
}

socket.on('contact', function(data , id){	      
	      sessionId = id;
	      fromClient({command : nickname , parameters : channel });
	      console.log(nickname);
	      console.log(id);
	  });
