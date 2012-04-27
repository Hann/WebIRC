
/*
 * GET home page.
 */


// login function
exports.index = function(req, res){
  res.render('index', { css: 'index', title: 'Welcome To WebIRC!' });
};

// chat function
exports.chat= function(req, res){
  res.render('chat', { css:'chat', title: 'connect IRC',
		     nickname : req.body.nickname,
		     channel : req.body.channelName });
};
