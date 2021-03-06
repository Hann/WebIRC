var TabManager = TabManager;
var Message = IRCPacket.Message;


var CommandEvent = {
    handlers : {},
    on : function (command, handler){
	if(!(command in this.handlers)){
	    this.handlers[command] = [];
	}
	this.handlers[command].push(handler);
    },
    emit : function (command, parameter, raw_packet, me){
	if(!(command in this.handlers)){
	    // normal packet
	    me.appendLog(raw_packet, 'freenode');
	    return ;
	}

	this.handlers[command][0](parameter, raw_packet, me);
	/*
	for (var i = 0, size = this.handlers[command].legnth ; i < size ; i++){
	    this.handlers[command](parameter, raw_packet, me);
	}
	 */
	
    }
};


CommandEvent.on('PING', function(packet, raw_packet, me) {
		    packet.command = 'PONG';
		    packet = packet.build();
		    me.sendToServer(packet);
		    
		});

CommandEvent.on('PONG', function(packet, raw_packet, me) {
		    packet.command = 'PING';
		    packet = packet.build();
		    me.sendToServer(packet);
		    
		});

CommandEvent.on('PRIVMSG', function(packet, raw_packet, me) {
		    var li_list = $('li a[data-toggle="tab"]');
		    var channel_name = packet.parameters[0].substring(1);
		    var check_duplication = true;
		    $.each(li_list , function(key, value) {
			       var contrast_channel_name = value.id;
			       console.log(contrast_channel_name + " vs " + channel_name);
			       if (contrast_channel_name == (channel_name + '_')){
				   check_duplication = false;
			       }
			   });
		    if (check_duplication){
			var tabManager = new TabManager();
			tabManager.addTab(channel_name);
			tabManager.openTheTab(channel_name);
			$('#tabs a[href="#' + channel_name + '"]').tab('show');
		    }
		    
		    // notification
		    if (window.webkitNotifications) {
			var message = packet.parameters[1];
			var user    = packet.prefix.nickname;
			var isMention = message.search(nickname) + 1;

			if (isMention){
			    if (window.webkitNotifications.checkPermission() == 0) { //0 isPERMISSION_ALLOWED
				me.createNotification(message, user);
			    }
			}
		    }
		    me.appendLog(packet.parameters[1], channel_name, packet.prefix.nickname);
		});
CommandEvent.on('JOIN_other', function(packet, raw_packet, me){
		    var channel_name = packet.parameters[0].substring(1);
		    var tabManager = new TabManager();
		    var enterUser = packet.prefix.nickname;
		    tabManager.addUser(channel_name, enterUser);
		});
		
CommandEvent.on('JOIN_me', function(packet, raw_packet, me){
		    var channel_name = packet.parameters[0].substring(1);
		    var tabManager = new TabManager();
		    tabManager.addTab(channel_name);
		    tabManager.openTheTab(channel_name);
		    $('#tabs a[href="#' + channel_name + '"]').tab('show');
		    me.refreshChatContainer();		    
		 });

CommandEvent.on('JOIN', function(packet, raw_packet, me) {
		    var enterUser =  packet.prefix.nickname;
		    if (enterUser == nickname){ // I enter
			CommandEvent.emit('JOIN_me', packet, raw_packet, me);
		    }
		    else {
			CommandEvent.emit('JOIN_other', packet, raw_packet, me);
		    }
		});
    
CommandEvent.on('MODE_joinChannel', function(packet, raw_packet, me){
		    var packetToServer = new Message('JOIN', channel).build();
		    me.sendToServer(packetToServer);
		    me.appendLog(packetToServer, 'freenode');	
	   	    
		});

CommandEvent.on('MODE', function(packet, raw_packet, me){
		    if (packet.parameters[0] == nickname){ // JOIN Channel
			CommandEvent.emit('MODE_joinChannel', packet, raw_packet, me);
			return;
		    }
		});

CommandEvent.on('TOPIC', function(packet, raw_packet, me){
		    var channel_name = packet.parameters[0].substring(1);
		    var topic = packet.parameters[1];
		    var tabManager = new TabManager();

		    tabManager.addTopic(channel_name, topic);
		});

CommandEvent.on('NICK', function(packet, raw_packet, me){
		    var changed_nickname = packet.parameters[0];
		    var previous_nickname = packet.prefix.nickname;
		    var tabManager = new TabManager();
		    tabManager.changeNickname(previous_nickname, changed_nickname);
                    nickname = changed_nickname;

//		    $('.' + previous_nickname).text(changed_nickname);
//		    $('.' + previous_nickname).addClass(changed_nickname).removeClass(previous_nickname);

		    });
CommandEvent.on('QUIT', function(packet, raw_packet, me){
		    var tabManager = new TabManager();
		    var quitUser = packet.prefix.nickname;
		    console.log(quitUser);
		    
//		    var quitUserLeaveMessage = packet.parameters[0];
//		    var quitNoticeMessage = quitUser + "님이 퇴장하셨습니다(" + quitUserLeaveMessage + ")";
//		    var channel_name = 
		    tabManager.goodByeUser(quitUser);
//		    appendLog(quitMessage, );
		});
CommandEvent.on('332', function(packet, raw_packet, me){ // change a topic
		    var channel_name = packet.parameters[1].substring(1);
		    var topic = packet.parameters[2];
		    var tabManager = new TabManager();
		    tabManager.addTopic(channel_name, topic);
		    console.log(channel_name + " " + topic);
});

CommandEvent.on('353', function(packet, raw_packet, me){ // user list in channel.
		    var channel_name = packet.parameters[2].substring(1);
		    var tabManager = new TabManager();
		    var raw_user_list = packet.parameters[3];
		    tabManager.addList(channel_name, raw_user_list);
		    appendLog(raw_packet, 'freenode');
});

CommandEvent.on('433', function(packet, raw_packet, me){ // duplicate nickname
		    var changed_nickname = nickname + "_";
		    var tabManager = new TabManager();

		    var packet = new Message('NICK', changed_nickname).build();
		    me.sendToServer(packet);

		    tabManager.changeNickname(nickname, changed_nickname);
//		    $('.' + nickname).text(changed_nickname);
//		    $('.' + nickname).addClass(changed_nickname).removeClass(nickname);
		    
		    nickname = changed_nickname;
		    
		});

