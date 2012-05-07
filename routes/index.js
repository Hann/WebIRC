
/*
 * GET home page.
 */


// login function
exports.index = function(req, res) {
  res.render('index', {
    title: 'Welcome To WebIRC!'   
  });
};

// chat function
exports.chat= function(req, res) {
  res.render('chat', {
    title: 'connect IRC',
    nickname : req.body.nickname,
    channel : req.body.channel
  });
};

exports.chatUI= function(req, res) {
  res.render('chatUI', {
    title: 'TOPIC',
    nickname : req.body.nickname,
    channel : req.body.channelName
  });
};

exports.test = function(req, res) {
  res.render('test', {
    title: 'test',
  });
};
