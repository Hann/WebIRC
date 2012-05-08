$(document).ready(function () {
  var logs = $('#logs');
  var Message = IRCPacket.Message;
  var Prefix = IRCPacket.Prefix;

  function addLog(prefix, message) {
    logs.append('<div><span class="' + prefix.toLowerCase() + '">' + prefix + ': </span>' + message + '</div>');

    logs.stop(true, true).animate({scrollTop: '+=20'});
  }
 
  var socket = io.connect('http://hann.iptime.org:1234');
  socket.on('ready', function () {
    addLog('R', 'ready');

    var message = new Message('NICK', 'HJHTest').build();
    socket.emit('relay', message);
    addLog('S', message);

    message = new Message('USER', 'HJHTest', 'HJHTest', 'chat.freenode.net', 'HJHTest').build();
    socket.emit('relay', message);
    addLog('S', message);
  });

  socket.on('relay', function (message) {
    addLog('R', message);
  });

  var $input = $('input');
  var lastMessage = '';

  $input.keyup(function (event) {
    if (event.which == 13) { // return
      lastMessage = $input.val();
      var message = new Message().parse(lastMessage).build();
      socket.emit('relay', message);
      addLog('S', message);
      
      $input.val('');
    } else if (event.which == 38) { // up arrow
      $input.val(lastMessage);
    }
  });
});