/*
 * IRCClient.js
 * 파싱된 데이터를 가지고 패킷으로 생성해주는 역할
 */

////////////////////////////
// Constructor method
////////////////////////////

var IRCClient = function(object) {
    this.command = object.commnad;
    this.parameters = object.parameters;
};

////////////////////////////
// methods
////////////////////////////

/*
 *  TO DO
 *  제이슨 --------> 써버에게줄 패킷처럼
 * 
 */

IRCClient.prototype.toYou = function(){
    var packet = this.command + this.parameters;
    return packet;
};