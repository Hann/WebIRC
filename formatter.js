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
  
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var formatPattern = /%(?:(0)?(\d+))?(?:\.(\d+))?([dfxXs%])/g;

  var format = function (text) {
    var parameters;
    var currentIndex = 0;

    // For String.prototype.format
    // if (Object.prototype.toString.call(arguments[1]) === "[object Arguments]")
    if (hasOwnProperty.call(arguments[1], 'callee')) // this condition is weaker than the above condition.. but.. because of IE under 9.....:'(
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

module.exports = Formatter;