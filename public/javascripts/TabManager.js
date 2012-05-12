/*
 * TabManager.js 
 * 
 */

var TabManager = function(){
    this.tabs = 1;
    
};

TabManager.prototype.openTheTab = function(channel) {
    var template =   "<div class = 'tab-pane active' id ='" + channel + "'>" +
                        "<div id = 'contents_" + channel + "'>" +
	                   "<div id = 'chat-box_" + cha + "' class = 'float-left'>" +
	                     "<div id = 'topic_" + channel + "'> <h1></h1> </div>" +
	                     "<div id = 'chat-container_" + channel + "'>" +
                                "<div id = 'time_" + channel + "' class = 'float-left'> </div>" +
                                "<div id = 'log_" + channel + "'> </div>"+
	                "</div>" +
                        "<div id = 'user_" + channel + "' class = 'float-right'>" +
                           "<ul id = 'nicks_" + channel + "' class = 'nav nav-tabs nav-stacked'>" + 
	                      "<li> <a href='#'> </li>" +
                           "</ul>" +
	                "</div>" +
	             "</div>";
    $('.tab-content').append(template);
    
};

TabManager.prototype.addTab = function(channel) {
    $('.nav-tabs:first').append("<li> <a href='#" + channel + "' id ='" + channel + "'data-toggle ='tab'>" + channel +"</a></li>");
   
};

TabManager.prototype.addList = function(channel) {
    $('#nicks_' + channel ).append("<a href='#'> + nickname + </a>");
};

TabManager.prototype.addTopic = function(channel , topic) {
    $('#topic_' + channel + ' h1').text(topic);
};
