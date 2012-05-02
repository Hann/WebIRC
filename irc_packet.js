var patterns = {
  digit: /[0-9]/,
  heximalDigit: /[0-9a-fA-F]/,
  letter: /[a-zA-Z]/,
  space: /\x20+/,
  special: /[\[\]\\\`\_\^\{\|\}]/,
  noSpaceCrLfColone: /[^\x00\x0A\x0D\x20:]/,

  message: /^(?::(<prefixType1>|<prefixType2>)<space>)?(<command>)(<parameters>)$/,
  prefixType1: /^(<serverName>)$/,
  prefixType2: /^(?:(<nickname>)(?:!(<user>))?(?:@(<host>))?)$/,
  command: /^(?:<letter>+)|(?:<digit><digit><digit>)$/,
  parameters: /^((?:<space><middle>){0,14})(?:<space>:(<trailing>))?$/,
  serverName: /^<hostName>$/,
  // nickname: /^(?:<letter>|<special>)(?:<letter>|<digit>|<special>|\-){0,8}$/, IRC RFC document says that length of nickname is up to 9. But when I tested in freenode, I can use the nickname up to 16
  nickname: /^(?:<letter>|<special>)(?:<letter>|<digit>|<special>|\-){0,15}$/,
  user: /^[^\x00\x0A\x0D\x20@]+$/,
  host: /^<hostName>|<hostAddress>$/,

  hostName: /^<shortName>(?:[\/\.]<shortName>?)*$/,
  hostAddress: /^<ip4Address>|<ip6Address>$/,

  shortName: /^(?:<letter>|<digit>)(?:<letter>|<digit>|\-)*(?:<letter>|<digit>)*$/,
  ip4Address: /^<digit>{1,3}\.<digit>{1,3}\.<digit>{1,3}\.<digit>{1,3}$/,
  ip6Address: /^(?:<heximalDigit>+(?::<heximalDigit>+){7})|(?:0:0:0:0:0:(?:0|FFFF|ffff):<ip4Address>)$/,

  middle: /^<noSpaceCrLfColone>(?::|<noSpaceCrLfColone>)*$/,
  trailing: /^(?::|\x20|<noSpaceCrLfColone>)*$/
};

// To do: regular expression optimizer(eg. (?:[abc])+ -> [abc]+)
(function (patterns) {
  console.log('Patternizer called');
  var sanitize = function (pattern) {
    var beginningOrEndPattern = /^\^?(.*?)\$?$/;
    var capturingGroupPatterns = [/^\(([^\?][^\:])/g, /([^\\])\(([^\?][^\:])/g];

    return pattern.match(beginningOrEndPattern)[1]
                  .replace(capturingGroupPatterns[0], '(?:$1')
                  .replace(capturingGroupPatterns[1], '$1(?:$2');
  };

  var isCompleted = false;
  var assignmentPattern = /<([a-zA-Z0-9]+)>/g;
  var cacheOfHasOwnProperty = Object.prototype.hasOwnProperty;
  do {
    isCompleted = true; // assume this logic is completed

    for (var key in patterns) if (cacheOfHasOwnProperty.call(patterns, key)) {
      if (assignmentPattern.test(patterns[key].source)) {
        var newPattern = patterns[key].source.replace(assignmentPattern, function (substring, name) {
          if (name in patterns) {
            return '(?:' + sanitize(patterns[name].source) + ')'; 
          }
        });

        patterns[key] = new RegExp(newPattern);
        isCompleted = isCompleted && false;
      } else {
        isCompleted = isCompleted && true;
      }
      
    }
  } while (isCompleted !== true)
})(patterns);


var IRCPacket = function (/* [prefix, ]command[, parameters ... ] */) {
  var length = arguments.length;
  if (length === 0) return ;

  var indexOfCommand = 0;
  if (arguments[0] instanceof IRCPacket.Prefix) {
    this.prefix = arguments[0];
    indexOfCommand += 1;
  }

  this.command = arguments[indexOfCommand].toUpperCase();
  
  if ((indexOfCommand + 1) < length) {
    this.parameters = [];

    for (var i = indexOfCommand + 1; i < arguments.length; i++) {
      this.parameters.push(arguments[i]);
    }
  }
}

// Edit: parameter part
IRCPacket.prototype.parse = function (rawPacket) {
  var message = rawPacket.match(patterns.message);
  if (message === null) throw new Error('IRCPacket::parse() : Invalid packet');

  if (typeof message[1] !== 'undefined') this.prefix = new IRCPacket.Prefix().parse(message[1]);
  
  this.command = message[2].toUpperCase();

  var parameters = message[3].match(patterns.parameters);
  if ((parameters[1] !== '') || (typeof parameters[2] !== 'undefined')) {
    this.parameters = [];

    parameters[1] = parameters[1].trim();
    if (parameters[1] !== '') {
      var middles = parameters[1].split(/\x20+/);
      for (var i = 0; i < middles.length; i++) {
        this.parameters.push(middles[i]);
      }
    }

    if (typeof parameters[2] !== 'undefined') this.parameters.push(parameters[2]);
  }

  return this;
};

IRCPacket.prototype.build = function () {
  var packet = '';
  if (this.hasOwnProperty('prefix')) packet = ':' + this.prefix.build();

  packet += this.command.toUpperCase();

  if (this.hasOwnProperty('parameters')) {
    var length = this.parameters.length;
    for (var i = 0; i < (length - 1); i++) {
      packet += ' ' + this.parameters[i];
    }

    packet += ' ' + ((this.parameters[length - 1].indexOf('\x20') !== -1) ? ':' : '') + this.parameters[length - 1];
  }

  console.log('PAKCET BUILT-> ' + packet);

  return packet + '\r\n';
};

IRCPacket.Prefix = function (type/*, parameters... */)
{
  if (type === 1) {
    this.serverName = arguments[1];
  } else if (type === 2) {
    this.nickname = arguments[1];
    if (typeof arguments[2] !== 'undefined') this.user = arguments[2];
    if (typeof arguments[3] !== 'undefined') this.host = arguments[3];
  }
};

IRCPacket.Prefix.prototype.parse = function (rawPrefix) {
  var prefix = rawPrefix.match(patterns.prefixType2);
  if (prefix !== null) {
    this.type = 2;
    this.nickname = prefix[1];
    if (typeof prefix[2] !== 'undefined') this.user = prefix[2];
    if (typeof prefix[3] !== 'undefined') this.host = prefix[3];

    return this;
  }
  
  prefix = rawPrefix.match(patterns.prefixType1);
  if (prefix !== null) {
    this.type = 1;
    this.serverName = prefix[1];

    return this;
  }

  throw new Error('IRCPacket::Prefix::parse() : Invalid prefix');
};

IRCPacket.Prefix.prototype.build = function () {
  var prefix = '';
  if (this.type == 1) {
    prefix = this.serverName;
  } else if (this.type == 2) {
    prefix = this.nickname;
    if (this.hasOwnProperty('user')) prefix += '!' + this.user;
    if (this.hasOwnProperty('host')) prefix += '@' + this.host;
  }

  console.log('PREFIX BUILT-> ' + packet);
  return prefix;
};


module.exports = IRCPacket;