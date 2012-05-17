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
	                   "<div id = 'chat-box_" + channel + "' class = 'float-left'>" +
	                     "<div id = 'topic_" + channel + "'> <h1></h1> </div>" +
	                     "<div id = 'chat-container_" + channel + "'class = 'chat'>" +
                                "<div id = 'time_" + channel + "' class = 'float-left time'> </div>" +
                                "<div id = 'log_" + channel + "'> </div>"+
	                "</div>" +
                        "<div id = 'user_" + channel + "' class = 'float-right'>" +
                           "<ul id = 'nicks_" + channel + "' class = 'nav nav-tabs nav-stacked'>" + 

                           "</ul>" +
	                "</div>" +
	             "</div>";
    $('.tab-content').append(template);
    
};

TabManager.prototype.addTab = function(channel) {
    $('.nav-tabs:first').append("<li> <a href='#" + channel + "' id ='" + channel + "_'data-toggle ='tab'>" + channel +"</a></li>");
   
};

TabManager.prototype.addList = function(channel, nicknames) {
    var arrayNicks = nicknames.split(" ");
    for (var i = 0 ; i < arrayNicks.length; i++){
	$('#nicks_' + channel ).append("<li><a href='#'>" + arrayNicks[i] + "</a></li>");
    }
};

TabManager.prototype.addUser = function(channel, nickname) {
    $('#nicks_' + channel ).append("<li><a href='#'>" + nickname + "</a></li>");
};
TabManager.prototype.addTopic = function(channel , topic) {
    $('#topic_' + channel + ' h1').text(topic);
};
