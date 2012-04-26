var Packet = function (packet)
{
	this.prefix = "";
	this.command = "";
	this.parameters = "";

	if (packet) this.parse(packet);	
}

Packet.Prefix = function (prefix)
{
	this.serverName = "";
	
	this.nickname = "";
	this.user = "";
	this.host = "";
	
	if (prefix) this.parse(prefix);	
}

Packet.Prefix.patterns =
{
	serverName: /^([a-zA-Z0-9\-\_]+(?:\.[a-zA-Z0-9\-\_]+)*\.[a-zA-Z0-9]+)$/,
	nicknameAndUserAndHost: /^([a-zA-Z](?:[a-zA-Z]|[0-9]|[\-_\[\]\\\`\^\{\}\|])*)(?:!([^\x20\x00\x0D\x0A@]+))?(?:@([a-zA-Z0-9\-\_]+(?:\.[a-zA-Z0-9\-\_]+)*\.[a-zA-Z0-9]+))?$/
}

Packet.Prefix.prototype.parse = function (prefix)
{
	var matches = prefix.match(Packet.Prefix.patterns.serverName);
	if (matches)
	{
		this.serverName = matches[1];
		return ;
	}
	matches = prefix.match(Packet.Prefix.patterns.nicknameAndUserAndHost);
	if (matches)
	{
		this.nickname = matches[1];
		this.user = matches[2];
		this.host = matches[3];
		return ;
	}
	
	throw new Error("Invalid prefix");
}

Packet.patterns = 
{
	frame: /^(?::([^\x20]+)\x20+)?([a-zA-Z]+|\d\d\d)(\x20+.*)$/,
	parameters: /^((?:\x20+[^:\x20]?[^\x20\x00\x0D\x0A]*)*)(?:\x20+:([^\x00\x0D\x0A]*))?$/
}

Packet.prototype.parse = function (packet)
{
	var matches = packet.match(Packet.patterns.frame);
	if (matches == null) throw new Error("Invalid packet");
	
	if (typeof matches[1] != "undefined") this.prefix = new Packet.Prefix(matches[1]);
	
	this.command = matches[2];
	
	// parameter parsing
	if (typeof matches[3] != "undefined")
	{
		var parameters = matches[3].match(Packet.patterns.parameters);
		if (typeof parameters[1] != "undefined") this.parameters = parameters[1].trim().split(/\s+/);
		if (typeof parameters[2] != "undefined") this.parameters.push(parameters[2]);
	}
}