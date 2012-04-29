/*
 * CommandReader.js
 * 데이터를 파싱해서 JSON으로 넘겨주는 역할
 * 
 */



//////////////////////////////
//Constructor method
//////////////////////////////


var CommandReader = function(){
    this.command = '';
    this.parameters = '';
    this.message = '';
    this.commandList = ['msg', 'join', 'nick','notice'];
};


//////////////////////////////
// RegExr patterns
//////////////////////////////

CommandReader.patterns = {
    
  split : /^\/([a-zA-Z]+)(?:[ ,]+)(.*)/g,
  command : /^\/[a-zA-Z]+/g //temp
    
};

//////////////////////////////
// fucntions
//////////////////////////////


/*
 * To do
 * 소문자로 바꿔주기.
 * notice가 인식이 안됨.
 */

CommandReader.prototype.parseText = function(rawText){    
    var splitData = rawText.split(CommandReader.patterns.split);
    if (splitData == rawText){ // 안잘렸으면 스플릿데이터가 같다.
	console.log('test');
	return {command : 'PRIVMSG' , parameters : rawText};
	
    }
    else {
	this.command = splitData[1];
	this.parameters = splitData[2];
	
	if(this.command in this.commandList){ // 유효한 커멘드 인지 검사.
	    return { command : this.command , parameters : this.parameters};
	}
	else{
	    throw new Error('Invalid command');
	}

    }
    throw new Error('Unexpected Error');
};