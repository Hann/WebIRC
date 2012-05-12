$(document).ready(function () {
		      var input = $('#message');
		      var Message = IRCPacket.Message;
		      var Prefix = IRCPacket.Prefix;
		      var tm = TabManager;

		      var socket = io.connect('http://hann.iptime.org');
		      var time = $('#time');
		      var log = $('#log');
		      var scrollHeight;
		      
		      function appendLog(message){
			  log.append("<p>" + message + "</p>");
			  time.append("<p>" + (new Date().toLocaleTimeString()) + "</p>");
		      }

		      function emit(message){
			  console.log('emit : ' + message);
			  socket.emit('relay', message);
		      }
		      function scroll(){
			  scrollHeight += 20;
			  $('#chat-container').scrollTop(scrollHeight);
		      }
		      
		      socket.on('ready', function(ip){
				    var message = new Message('NICK' , nickname).build();			
				    emit(message);
				    
				    message = new Message('USER', nickname, ip, 'chat.freenode.net', nickname).build();
				    console.log("NICK ",message);
				    emit(message);
				    appendLog(message);
				    
				    message = new Message('JOIN', channel).build();
				    emit(message);
				    appendLog(message);
				});

		      socket.on('relay', function(message){
				    var li = $('li a[data-toggle="tab"]');
				    var packet = new Message().parse(message);
				    if (packet.command === 'PING'){
					packet.command = 'PONG';
					packet = packet.build();
					emit(packet);
				    }
				    else{
					console.log(packet);
					if (packet.command === 'PRIVMSG'){
					    var tab = new tm();
					    var count = 0;
					    $.each(li , function(key, value) {
						       console.log(value.id + " vs " + packet.parameters[0].substring(1));
						       if (value.id == packet.parameters[0].substring(1)){
							   count++;
						       }
						   });
					    if (count== 0) {
						tab.addTab(packet.parameters[0].substring(1));
					    }
					}

					console.log(packet);
					appendLog(message);
					scroll();
				    }
				});


		      $(function(){
			    $(window).resize(function(){
						 width = parseInt($(this).width());
						 height = parseInt($(this).height());
						 scrollHeight = height;
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
						  appendLog(message);

					      }
					      message = new Message().parse(data.command + " " + data.parameters).build();
					      emit(message);
					      input.val('');
					      
					      scroll();
					  }
				      }
				  });
		  });
