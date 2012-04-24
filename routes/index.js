
/*
 * GET home page.
 */


// login function
exports.index = function(req, res){
  res.render('index', { title: 'Welcome To WebIRC!' });
};

// join function
exports.join= function(req, res){
  res.render('join', { title: 'connect IRC',
		     nickname : req.body.nickname,
		     channel : req.body.channel });
};
