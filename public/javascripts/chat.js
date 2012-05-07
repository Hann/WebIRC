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
/*			   if (width > 1024 && width < 1280){
			       $("link[href*='chat']").attr("href","stylesheets/chat-1024.css");
			   }
			   else if (width > 1280){
			       $("link[href*='chat']").attr("href","stylesheets/chat-1280.css");
			   }*/
		       }).resize();
  });
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
		var log = "<p>"+ nickname + " : " +  parsedData.parameters +"</p>";
		var time = "<p>" + (new Date().toLocaleTimeString()) + "</p>";
		$('#log').append(log);
		$('#time').append(time);
		/*
		$('#log').append("<p><font color ='" + parsedData.color + "' >" + parsedData.parameters + "</font></p>");
		$('#time').append("<p><font color ='" + parsedData.color + "'>" + (new Date().toLocaleTimeString()) + "</font></p>");
		 */
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
