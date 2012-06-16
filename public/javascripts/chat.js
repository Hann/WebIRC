/*
 *  variables
 */
var Message = IRCPacket.Message;
var Prefix = IRCPacket.Prefix;
var TabManager = TabManager;
var commandEvent = CommandEvent;
var CommandReader = CommandReader;
var socket = io.connect('http://thehjh.com'); // own address
var pullScrollBar = 20;
var me = this;
var tagToReplace = {
    '&' : '&amp;',
    '<' : '&ltl',
    '>' : '&gt;'
};

/*
 *  functions
 */

function requestNotificationPermision(){
	window.webkitNotifications.requestPermission();
}

function createNotification(message, user) {
    var icon = 'images/hyeon.jpg';
    var title = user + "님이 언급하셨습니다. **WebIRC**" ;
    var popup = window.webkitNotifications.createNotification(icon, title, message);
    popup.show();
    console.log('shown');
    setTimeout(function() {
		   popup.cancel();
	       }, '15000');
    
}

function tags_replace(message){
    return message.replace(/[&<>]/g, function(tag){
	return tagsToReplace[tag] || tag;
    });
}
function appendLog(message, channel, user_id){
    // who typed a message!
    if (typeof user_id != 'undefined'){
	user_id = user_id + " : ";
    }
    else{
	user_id = '';	
    }
    var date = new Data();
    var curruntTime = data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    message = tags_replace(message);
    $('#log_' + channel).append("<p class='log-overflow-hider'>" + user_id + message + "</p>");
    $('#time_' + channel).append("<p class='log-overflow-hider'>" + (curruntTime) + "</p>");
    scrollDown();

}

function noticeChattingSystem(message, channel){
    if (typeof channel == 'undefined'){
	channel = '';
    }
    $('#log_' + channel).append("<p><span>" + message + "</span></p>");
    $('#time_' + channel).append("<p></p>");
    
}
function sendToServer(packet){
    console.log('emit : ' + packet);
    socket.emit('relay', packet);
}


function refreshChatContainer(){
    // refresh the chat-container. because, while created a new tab, It it tiny size.
    var width = parseInt($(this).width());
    var height = parseInt($(this).height());
    $('.chat').height(height-140);
    $('.chat').width(width-160);
}

function scrollDown(){ 
    pullScrollBar += 20;
    console.log(pullScrollBar);
    $('.chat').scrollTop(pullScrollBar);
}
	   
/*
 *  body
 */

//socket comucation
socket.on('ready', function(ip){
	      var built_packet = new Message('NICK', nickname).build();
      	      sendToServer(built_packet);    
	      
	      built_packet = new Message('USER', nickname, ip, 'chat.freenode.net', nickname).build();
	      sendToServer(built_packet);
	      if (window.webkitNotifications) {
		  if (window.webkitNotifications.checkPermission()> 0){
		      $('#myModal').modal({ show : true});
		  }
	      }
	  });
	  
	  
socket.on('relay', function(raw_packet){
	      var cutting_packet = new Message().parse(raw_packet);
	      console.log(cutting_packet);
	      commandEvent.emit(cutting_packet.command, cutting_packet, raw_packet, me);	      
	   });



// flexible chat-container size
$(function(){
      $(window).resize(function(){
			   var width = parseInt($(this).width());
			   var height = parseInt($(this).height());
			   $('.chat').height(height-140);
			   $('.chat').width(width-160);
		       }).resize();
  });


// please don't leave page.
if (document.addEventListener) {
    window.addEventListener('beforeunload', function() {
				return "다른 페이지로 이동하면 IRC에서 나오게됩니다.";
			    }, false);
    // IE
} else {
    window.attachEvent('onbeforeunload', function(event) {
			   if (event) {
			       event.returnValue = "다른 페이지로 이동하면 IRC에서 나오게됩니다.";
			   }
		       });
}

//enter keyboard 
$(document).ready(function () {
var input = $('#message');
$('#message').keypress(function (event){
		if (event.which == 13){
		    var message = input.val();
		    if (message != ''){ 
			var commandGenerator = new CommandReader();
			var raw_packet = commandGenerator.parseText(message);
			var active_channel = $('li.active a').attr('id').replace('_', '');
			if (raw_packet.command == "PRIVMSG"){
			    appendLog(message, active_channel, nickname);
			}
			packet = new Message().parse(raw_packet.command + " " + raw_packet.parameters).build();
			sendToServer(packet);
			input.val('');
		    }
		}
	    });

