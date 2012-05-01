﻿var Packet = function (packet) {
  this.prefix = null;
  this.command = '';
  this.parameters = [];
  
  if (arguments.length === 0) {
    return ;
  } else if (arguments.length === 1) {
    if (packet) this.parse(packet);
  } else {
    // if there's no parameters, you MUST use [] instead of blank.
    
    // prefix, command, parameters
    // command, parameters
    
    // 조건이 너무 많은가?.. defensive하게 프로그램을 짜라고 배웠는데... //너코드는 너무 복잡해!!!!!
    if ((arguments.length === 3) && (arguments[0] instanceof Packet.Prefix)
        && (Object.prototype.toString.apply(arguments[1]) === '[object String]')
        && (Object.prototype.toString.apply(arguments[2]) === '[object Array]')) {
        this.prefix = arguments[0];
        this.command = arguments[1].toUpperCase();
        this.parameters = arguments[2];			
    } else if ((arguments.length === 2) && (Object.prototype.toString.apply(arguments[0]) === '[object String]')
        && (Object.prototype.toString.apply(arguments[1]) === '[object Array]')) {
        this.command = arguments[0].toUpperCase();
        this.parameters = arguments[1];
    } else {
      throw new Error("Invalid packet arguments");
    }
  }
}

Packet.prototype.patterns = {
  frame: /^(?::([^\x20\x00\x0D\x0A]+)\x20+)?([a-zA-Z]{1,15}|[0-9][0-9][0-9])((?:\x20+.*))?$/,
  parameters: /^((?:\x20+[^:\x20\x00\x0D\x0A][^\x20\x00\x0D\x0A]*)*)(?:\x20+:([^\x00\x0D\x0A]*))?$/
}

Packet.prototype.parse = function (packet) {
  var matches = packet.match(this.patterns.frame);
  if (matches === null) throw new Error('Invalid packet');
  
  if (typeof matches[1] !== 'undefined') this.prefix = new Packet.Prefix(matches[1]);
  
  this.command = matches[2];
  
  // parameter parsing
  if (typeof matches[3] !== 'undefined') {  
    var parameters = matches[3].match(this.patterns.parameters);
    if (typeof parameters[1] !== 'undefined') {
       var middleParameters = parameters[1].split(/\x20+/);
       for (var i = 0; i < middleParameters.length; i++) {
         middleParameters[i] = middleParameters[i].trim();
         if (middleParameters[i] !== '') this.parameters.push(middleParameters[i]);
       } 
    }
    
    if (typeof parameters[2] !== 'undefined') this.parameters.push(parameters[2]);
  }
}

Packet.prototype.build = function () {
  var output = '';
  if (this.prefix) output = ':' + this.prefix.build() + ' ';
  output += this.command;
  
  var length = this.parameters.length;
  if (length > 0) {
    for (var i = 0; i < length - 1; i++) output += ' ' + this.parameters[i];
    if (this.parameters[length - 1].indexOf(' ') !== -1) output += ' :' + this.parameters[length - 1];
    else output += ' ' + this.parameters[length - 1];
  }
  
  return output;
}

Packet.Prefix = function (prefix) {
  this.type = 0;
  
  this.serverName = '';
  
  this.nickname = '';
  this.user = '';
  this.host = '';
  
  if (arguments.length === 0) {
    return ;
  } else if (arguments.length === 1) {
    if (prefix) this.parse(prefix);
  } else {
    // serverName -> 위의 this.parse()에서 적절하게 처리 됩니다 -_-;;
    // nickname!user@host
    if ((arguments.length === 3)
        && (Object.prototype.toString.apply(arguments[0]) === '[object String]')
        && (Object.prototype.toString.apply(arguments[1]) === '[object String]')
        && (Object.prototype.toString.apply(arguments[2]) === '[object String]')) {
        this.type = 2;
        this.nickname = arguments[0];
        this.user = arguments[1];
        this.host = arguments[2];
    } else {
      throw new Error("Invalid prefix arguments");
    }
  }
}

Packet.Prefix.prototype.patterns = {
  type1: /^([0-9a-zA-Z\-\_]+(?:[\.\:\/][0-9a-zA-Z\-\_]*)*)$/,
  type2: /^([a-zA-Z\-\_\[\]\\\`\^\{\}\|][a-zA-Z\-\_\[\]\\\`\^\{\}\|0-9]*)(?:!([^\x20\x00\x0D\x0A@]+))?(?:@([0-9a-zA-Z\-\_]+(?:[\.\:\/][0-9a-zA-Z\-\_]*)*))?$/
}

Packet.Prefix.prototype.parse = function (prefix) {
  var matches = prefix.match(this.patterns.type1);
  
  if (matches !== null) {
    this.type = 1;
    this.serverName = matches[1];
    
    return ;
  }
  
  matches = prefix.match(this.patterns.type2);
  if (matches !== null) {
    this.type = 2;
    this.nickname = matches[1];
    if (typeof matches[2] !== 'undefined') this.user = matches[2];
    if (typeof matches[3] !== 'undefined') this.host = matches[3];
    
    return ;
  }
  
  throw new Error('Invalid prefix');
}

Packet.Prefix.prototype.build = function () {
  if (this.type === 1) {
    return this.serverName;
  } else if (this.type === 2) {
    var output = this.nickname;
    if (this.user) output += '!' + this.user;
    if (this.host) output += '@' + this.host;
    
    return output;
  } else {
    throw new Error('Invalid prefix type');
  }
}

module.exports = Packet;