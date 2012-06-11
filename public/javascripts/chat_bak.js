$(document).ready(function () {
		      var input = $('#message');
		      var Message = IRCPacket.Message;
		      var Prefix = IRCPacket.Prefix;
		      var tm = TabManager;

		      var socket = io.connect('http://hann.iptime.org');
		      var time = "#time";
		      var log = "#log";
		      var scrollHeight;
		      
		      function appendLog(message, active, id){
			  if (typeof id == 'undefined'){
			      id = '';
			  }
			  else{
			      id = id + " : ";
			  }

			  $('#log_' + active).append("<p>" + id + message + "</p>");
			  $('#time_' + active).append("<p>" + (new Date().toLocaleTimeString()) + "</p>");
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
				    //error시에 차근차근 스텝밟을 수 있도록 해야 한다.
				    var message = new Message('NICK' , nickname).build();			
				    var active = $('li.active a').text();
				    emit(message);
				    
				    message = new Message('USER', nickname, ip, 'chat.freenode.net', nickname).build();
				    console.log("NICK ",message);
				    emit(message);
				    appendLog(message, 'freenode');
				    
				    message = new Message('JOIN', channel).build();
				    emit(message, active);
				    appendLog(message, 'freenode');
				});

		      socket.on('relay', function(message){
				    var li = $('li a[data-toggle="tab"]');
				    var packet = new Message().parse(message);
				    var active = $('li.active a').text();
				    var tab = new tm();
				    if (packet.command === 'PING'){
					packet.command = 'PONG';
					packet = packet.build();
					emit(packet);
				    }
				    else if(packet.command === 'PRIVMSG'){

					    var count = 0;
					    var ch = packet.parameters[0].substring(1);
					    $.each(li , function(key, value) {
						       console.log(value.id + " vs " + ch);
						       if (value.id == (ch + "_")){
							   count++;
						       }
						   });
					    if (count== 0) {
						tab.addTab(ch);
						tab.openTheTab(ch);
					    }
					appendLog(packet.parameters[1], ch, packet.prefix.nickname);
				    }
				    else if (packet.command === "JOIN") {
					var ch = packet.parameters[0].substring(1);
					tab.addTab(ch);
					tab.openTheTab(ch);

				    }

				    else if (packet.command === "332") {					
					var ch = packet.parameters[1].substring(1);
					var topic = packet.parameters[2];
					appendLog(message, 'freenode');
					tab.addTopic(ch, topic);
					console.log(ch + " " + topic);
				    }
				    else if (packet.command === "353"){
					var ch = packet.parameters[2].substring(1);
					appendLog(message, 'freenode');
					tab.addList(ch, packet.parameters[3]);

				    }
				    else if (packet.command === "433"){
					nickname = nickname + "_";
					var message = new Message('NICK' , nickname).build();			
					emit(message);
					$('#nickname').text(nickname);
					
				    }
				    else if (packet.command === "TOPIC"){
					var ch = packet.parameters[0].substring(1);
					var topic = packet.parameters[1];
					console.log(ch + " " + topic);
					tab.addTopic(ch, topic);
					

				    }
				    else if (packet.command === "NICK") {
					
				    }
				    else{
					appendLog(message, 'freenode');
				    }
				    console.log(packet);
				    scroll();
				    
				});


		      $(function(){
			    $(window).resize(function(){
						 width = parseInt($(this).width());
						 height = parseInt($(this).height());
						 scrollHeight = height;
						 $('.chat').height(height-140);
						 $('.chat').width(width-140);
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
					      var active = $('li.active a').text();
					      if (data.command == "PRIVMSG"){
						  appendLog(message, active, nickname);
					      }
					      message = new Message().parse(data.command + " " + data.parameters).build();
					      emit(message);
					      input.val('');
					      
					      scroll();
					  }
				      }
				  });
		  });
