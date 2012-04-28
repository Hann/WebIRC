/*
function enterKeyEvent(event){
    body.append(event.key);
}
*/



//////////////////////////////
//Constructor method
//////////////////////////////

var CommandReader = function(text){
    this.command = '';
    this.parameters = '';
    this.message = '';
    this.commandList = ['msg', 'join', 'nick','notice'];
    this.parseText(text);
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

CommandReader.prototype.parseText = function(rawText){
    
    var splitData = rawText.split(CommandReader.patterns.split);
    if (splitData == rawText){ // 안잘렸으면 스플릿데이터가 같다.
	return {command : 'PRIVMSG' , parameters : rawText};
    }
    else {
	this.command = splitData[1];
	this.parameters = splitData[2];
	
	if(this.command in this.commandList){ // 유효한 커멘드 인지 검사.
	    return { command : this.command , parameters : this.parameters};
	}
	else{

	}

    }
    throw new Error('Unexpected Error');
};