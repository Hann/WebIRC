/*
 * TabManager.js 
 * 
 */

var TabManager = function(){
    this.tabs = 1;
    
};

TabManager.prototype.openTheTab = function(active) {
    var template =   "<div class = 'tab-pane active' id ='" + active + "'>" +
                        "<div id = 'contents_" + active + "'>" +
	                   "<div id = 'chat-box_" + active + "' class = 'float-left'>" +
	                     "<div id = 'topic_" + active + "'> <h1></h1> </div>" +
	                     "<div id = 'chat-container_" + active + "'>" +
                                "<div id = 'time_" + active + "' class = 'float-left'> </div>" +
                                "<div id = 'log_" + active + "'> </div>"+
	                "</div>" +
                        "<div id = 'user_" + active + "' class = 'float-right'>" +
                           "<ul id = 'nicks_" + active + "' class = 'nav nav-tabs nav-stacked'>" + 
	                      "<li> <a href='#'> </li>" +
                           "</ul>" +
	                "</div>" +
	             "</div>";
    $('.tab-content').append(template);
    
};

TabManager.prototype.addTab = function(active) {
    $('.nav-tabs:first').append("<li> <a href='#" + active + "' data-toggle ='tab'>" + active +"</a></li>");
   
};

TabManager.prototype.addList = function(active) {
    $('#nicks_' + active ).append("<a href='#'> + nickname + </a>");
};

TabManager.prototype.addTopic = function(active , topic) {
    $('#topic_' + active + ' h1').text(topic);
};
