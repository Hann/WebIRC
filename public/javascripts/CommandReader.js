/*
 * CommandReader.js
 * 데이터를 파싱해서 JSON으로 넘겨주는 역할
 * 
 */



//////////////////////////////
// Constructor method
//////////////////////////////


var CommandReader = function(){
    this.command = '';
    this.parameters = '';
    this.message = '';
    this.commandList = { MSG : 1, JOIN : 1, NICK : 1, NOTICE : 1 };
};


//////////////////////////////
// RegExr patterns
//////////////////////////////

CommandReader.patterns = {
    
  split : /^\/([a-zA-Z]+)(?:[ ,]*)(.*)/g,
  command : /^\/[a-zA-Z]+/g //temp
    
};

//////////////////////////////
// methods
//////////////////////////////


CommandReader.prototype.parseText = function(rawText){    
    console.log(rawText);
    var splitData = rawText.split(CommandReader.patterns.split);
    var active = $('div[class*=active]').attr('id');
    if (splitData == rawText || (splitData[1].toUpperCase() == "MSG")){ // 안잘렸으면 스플릿데이터가 같다.
	return {command : 'PRIVMSG' , parameters : active + ": " + rawText, color : 'black'};
    }
    else {
	this.command = splitData[1].toUpperCase();
	this.parameters = splitData[2];
	if(this.command in this.commandList){ // 유효한 커멘드 인지 검사.
	    if (this.command == "NICK"){
		return { command : this.command , parameters : this.parameters};
	    }
	    else {
		return { command : this.command , parameters : active + ": " + this.parameters};
	    }
	}
	else{
	    return { command : "invalid" , parameters : 'invalid commnad', color :'gray'};
	}

    }
    throw new Error('Unexpected Error');
};