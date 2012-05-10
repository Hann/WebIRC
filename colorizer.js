var Colorizer = {
  pattern: /<(reset|black|red|green|yellow|blue|magenta|cyan|white)>{(.*?[^\\]?)}/g,
  colors: {
    reset: '\033[0m',
    black: '\033[30m',
    red: '\033[31m',
    green: '\033[32m',
    yellow: '\033[33m',
    blue: '\033[34m',
    magenta: '\033[35m',
    cyan: '\033[36m',
    white: '\033[37m'
  },

  colorize: function (text) {
    var output = text.replace(Colorizer.pattern, function (substring, color, text) {
      return Colorizer.colors[color] + text + Colorizer.colors['reset'];
    });

    return output.replace(/\\([{}])/g, '$1');
  }
};

module.exports = Colorizer;