var IRCPacket = (function () {
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var patterns = {
    /* nickname: [a-zA-Z\[\]\\\`\_\^\{\|\}][a-zA-Z0-9\[\]\\\`\_\^\{\|\}\-]{0,15} */
    /* user: [^\x00\x0A\x0D\x20\@]+ */
    /* host: [^\x00\x0A\x0D\x20]+ */
    /* middle: [^\x20\:][^\x20]* */
    /* trailing: .* */

    // prefix -> write it specifically
    prefix: [/^((?:[a-zA-Z0-9\-]+[\.\/]?)+)$/, /^([a-zA-Z\[\]\\\`\_\^\{\|\}][a-zA-Z0-9\[\]\\\`\_\^\{\|\}\-]{0,15})(?:\!([^\@]+))?(?:\@(.+))?$/],
    message: /^(?:\:([^\x20]+)\x20+)?([0-9][0-9][0-9]|[a-zA-Z]+)(.*)$/,
    parameters: /^\x20+((?:[^\x20\:][^\x20]*\x20+)*[^\x20\:][^\x20]*)?(?:\x20*\:(.*))?$/
  }
    
  var Prefix = function (type/*, parameters... */) {
    if (type === 1) {
      this.serverName = arguments[1];
    } else if (type === 2) {
      this.nickname = arguments[1];
      if (typeof arguments[2] !== 'undefined') this.user = arguments[2];
      if (typeof arguments[3] !== 'undefined') this.host = arguments[3];
    }
  };
  

  Prefix.prototype.parse = function (prefix) {
    console.log(prefix);
    // pattern[0] and pattern[1] can be matched at the same time
    // so at first, pattern[1] will be matched because it has more complex and strong rules 
    var matches = prefix.match(patterns.prefix[1]);
    if (matches !== null) {
      this.type = 2;
      this.nickname = matches[1];
      if (typeof matches[2] !== 'undefined') this.user = matches[2];
      if (typeof matches[3] !== 'undefined') this.host = matches[3];

      return this;
    }

    matches = prefix.match(patterns.prefix[0]);
    if (matches !== null) {
      this.type = 1;
      this.serverName = matches[1];

      return this;
    }

    throw new Error('IRCPacket::Prefix::parse() : Invalid prefix');
  };


  Prefix.prototype.build = function () {
    var prefix = '';

    if (this.type == 1) {
      prefix = this.serverName;
    } else if (this.type == 2) {
      prefix = this.nickname;
      if (hasOwnProperty.call(this, 'user')) {
        prefix += '!' + this.user;
      }

      if (hasOwnProperty.call(this, 'host')) {
        prefix += '@' + this.host;
      }
    }

    return prefix;
  };

  var Message = function (/*[prefix, ]command[, parameters...]*/) {
    var length = arguments.length;
    if (length === 0) return ;

    var indexOfCommand = 0;
    
    if (arguments[0] instanceof IRCPacket.Prefix) {
      this.prefix = arguments[0];
      indexOfCommand = 1;
    }

    this.command = arguments[indexOfCommand].toUpperCase();

    if ((indexOfCommand + 1) < length) {
      this.parameters = [];

      for (var i = indexOfCommand + 1; i < length; i++) {
        this.parameters.push(arguments[i]);
      }
    }
  };

  Message.prototype.parse = function (message) {
    var matches = message.match(patterns.message);
    if (matches === null) throw new Error('IRCPacket::Message::parse() : Invalid message');
    
    // prefix
    if (typeof matches[1] !== 'undefined') this.prefix = new Prefix().parse(matches[1]);

    // command
    this.command = matches[2];

    // parameters
    if (matches[3] === '') return ; // no parameters
    matches = matches[3].match(patterns.parameters);
    if (matches === null) throw new Error('IRCPacket::Message::parse() : Invalid parameters');
    
    var parameters = [];

    // middles
    if (typeof matches[1] !== 'undefined') {
      parameters = matches[1].split(/\x20+/g);
    }
    
    // trailing
    if (typeof matches[2] !== 'undefined') {
      parameters.push(matches[2]);
    }

    if (parameters.length > 0) this.parameters = parameters;

    return this;
  };

  Message.prototype.build = function () {
    var message = '';
    if (hasOwnProperty.call(this, 'prefix')) {
      message = this.prefix.build();
    }

    message += this.command;

    if (hasOwnProperty.call(this, 'parameters')) {
      var length = this.parameters.length;
      for (var i = 0; i < (length - 1); i++) {
        message += ' ' + this.parameters[i];
      }

      message += ' ' + ((this.parameters[length - 1].indexOf(' ') !== -1) ? ':' : '') + this.parameters[length - 1];
    }
    
    return message + '\r\n';
  };

  return {
    Prefix: Prefix,
    Message: Message
  };
})();


if ((typeof module !== 'undefined') && (Object.prototype.hasOwnProperty.call(module, 'exports'))) {
  module.exports = IRCPacket;
}