var socket = io.connect('http://hann.iptime.org');
var sessionId;

function fromClient(message){    
    socket.emit('fromClient' , { command : message.command , parameters : message.parameters}, sessionId);
    console.log(message.command, message.parameters);
}

function enterKeyEvent(event){
    if (event.keyCode == 13){
	var message = $('#chattingMessage').val();
	if (message != ''){
	    var cr = new CommandReader();
	    var parsedData = cr.parseText(message);
	    if (!(parsedData.command in cr.commandList)){
		$('body').append("<p><font color ='" + parsedData.color + "' >" + parsedData.parameters + "</font></p>");
	    }
	    else {
		if (parsedData.command == 'MSG'){
		    parsedData.command = "PRIVMSG";
		}
	    }
	    console.log(parsedData);
	    fromClient(parsedData);
	    $('#chattingMessage').val('');
	}
    }
}

socket.on('contact', function(data , id){	      
	      sessionId = id;
	      $('body').append(data);
	      fromClient({command : nickname , parameters : channel });
	      console.log(nickname);
	      console.log(id);
	  });
