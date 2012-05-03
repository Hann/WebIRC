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
// fucntions
//////////////////////////////


CommandReader.prototype.parseText = function(rawText){    
    console.log(rawText);
    var splitData = rawText.split(CommandReader.patterns.split);
    if (splitData == rawText){ // 안잘렸으면 스플릿데이터가 같다.
	console.log(splitData);
	return {command : 'PRIVMSG' , parameters : rawText, color : 'black'};
    }
    else {
	this.command = splitData[1].toUpperCase();
	this.parameters = splitData[2];
	
	if(this.command in this.commandList){ // 유효한 커멘드 인지 검사.
	    return { command : this.command , parameters : this.parameters};
	}
	else{
	    return { command : "invalid" , parameters : 'invalid commnad', color :'gray'};
	}

    }
    throw new Error('Unexpected Error');
};