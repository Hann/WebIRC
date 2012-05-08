var Formatter = (function () {
  var generatePad = function (text, length, character) {
    if (text.length > length) return '';

    character = character || ' '; // default value

    var pad = '';
  	for (var i = 0, count = length - text.length; i < count; i++) pad += character;

    return pad;
  };

  var padLeft = function (text, length, character) {
    return generatePad(text, length, character) + text;
  };

  var padRight = function (text, length, character) {
    return text + generatePad(text, length, character);
  };

  var parsingFunctions = {
    d: parseInt,
    f: parseFloat,
    x: function (value) {
      return parseInt(value).toString(16).toLowerCase();
    },
    X: function (value) {
      return parseInt(value).toString(16);
    },
    s: function (value) {
      return value + '';
    }
  };
  
  var formatPattern = /%(?:(0)?(\d+))?(?:\.(\d+))?([dfxXs%])/g;

  var format = function (text) {
    var parameters;
    var currentIndex = 0;

    // For String.prototype.format
    if (Object.prototype.toString.call(arguments[1]) == "[object Arguments]")
    {
      // String.prototype.format -> arguments = [String, arguments[]]
      parameters = Array.prototype.slice.call(arguments[1], 0);
    }else
    {
      parameters = Array.prototype.slice.call(arguments, 1);
    }

    return text.replace(formatPattern, function (substring, padder, width, precision, type) {
      if (type === '%') return '%'; // escaping

      padder = padder || ' '; // default values
      width = width || 0;
      precision = precision || 10;

      var value = parsingFunctions[type](parameters[currentIndex++]);
      switch (type) {
        case 'd':
        case 'x':
        case 'X':
          value = value.toString();
          break;
        case 'f':
          value = value.toFixed(precision);
          break;
      }

      if (width) value = padLeft(value, width, padder);

      return value;
    });
  };

  return {
    format: format
  };
})();

String.prototype.format = function () { return Formatter.format.call(Formatter, this, arguments); };

$(document).ready(function () {
  var $logs = $('#logs');
  var $input = $('#message input');

  var Message = IRCPacket.Message;
  var Prefix = IRCPacket.Prefix;
 
  function addLog(prefix, message) {
    var className = '';

    if (arguments.length === 1) {
      message = prefix;
      prefix = '';
    }

    prefix = prefix.toLowerCase();

    var className = '';
    if ((prefix === 's') || (prefix === 'send')) {
      className = 'send';
    } else if ((prefix === 'r') || (prefix === 'recv') || (prefix === 'receive')) {
      className = 'receive';
    }
    
    var output = message;
    if (prefix !== '') output = '<span%s>%s&gt;</span> '.format(((className !== '') ? ' class="' + className + '"' : ''), prefix.toUpperCase()) + output;
    output = '<div>' + output + '</div>';

    $logs.append(output);
    $logs.stop(true, true).animate({scrollTop: '+=20'});
  }


  var socket = io.connect('http://thehjh.com');
  socket.on('ready', function (ip) {
    addLog('r', 'ready, and my ip is %s'.format(ip));
    
    var message = new Message('NICK', 'HJHTest').build();
    socket.emit('relay', message);
    addLog('s', message);

    var hostName = 'webirc/' + ip;
    message = new Message('USER', 'HJHTest', hostName, 'chat.freenode.net', 'HJHTest').build();
    socket.emit('relay', message);
    addLog('s', message);
  });
  
  socket.on('relay', function (message) {
    addLog('r', message);

    message = new Message().parse(message);
    if (message.command === 'PING') {
      message.command = 'PONG';

      message = message.build();
      socket.emit('relay', message);
      addLog('s', message);
    }
  });

  var history = {
    history: [''],
    indicator: 0,
    MAXIMUM_SIZE: 20,

    addHistory: function (contents) {
      this.history = this.history.slice(0, this.indicator + 1);
      this.history[this.indicator] = contents;
      this.history.push('');

      this.indicator++;

      if (this.history.length > (this.MAXIMUM_SIZE + 1)) {
        this.history = this.history.slice(1);
        this.indicator--;
      }
    },

    getPreviousHistory: function () {
      if (this.indicator !== 0) this.indicator--;

      return this.history[this.indicator];
    },


    getNextHistory: function () {
      if (this.indicator !== (this.history.length - 1)) this.indicator++;

      return this.history[this.indicator];
    }
  };

  function setCaretPosition($element, position) {
    var element = $element.get(0);

    if (element.setSelectionRange) {
      element.focus();
      element.setSelectionRange(position, position);
    } else if (element.createTextRange) {
      var range = element.createTextRange();
      range.collapse(true);
      range.moveEnd('character', position);
      range.moveStart('character', position);
      range.select();
    }
  }
  
  $input.keydown(function (event) {
    if (event.which === 13) { // return key
      var message = new Message().parse($input.val()).build();
      socket.emit('relay', message);
      addLog('s', message);
      history.addHistory(message.trim()); // CAUTION: low version IEs doesn't support trim because of trim is javascript method that was added recently

      $input.val('');

    } else if (event.which === 38) { // up-arrow key
      event.preventDefault();
      $input.val(history.getPreviousHistory());
      setCaretPosition($input, $input.val().length);
    } else if (event.which === 40) { // down-arrow key
      event.preventDefault();
      $input.val(history.getNextHistory());
      setCaretPosition($input, $input.val().length);
    }
  });
});