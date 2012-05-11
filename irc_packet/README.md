#IRCPacket

##Terminology
1. Prefix: Message의 앞에 붙는 부가 정보
2. Message: packet의 본체, packet의 전부라고도 할 수 있음

##IRCPacket
- Prefix
- Message

1. Prefix
- constructors
  - Prefix(type, parameter1[, parameter2, ...])
    - type:Number -> Prefix의 타입, 1과 2가 존재합니다
    - parameterN: String
      - type 1
        - Prefix(1, serverName)
          - serverName: String -> server name
      - type 2
        - Prefix(2, nickname[, user, host])
          - nickname: String -> nickname
          - user: String -> user name
          - host: String -> host

- properties
  * properties는 해당 값이 존재할 때만 객체에 저장됩니다
    즉, Prefix(2, 'HJH')일 경우, 생성된 객체의 properties는 type, nickname만 존재합니다.
    안전한 사용을 위해서 type 체크와 hasOwnProperty('propertyName') method를 사용하십시오
    - example
      var prefix = new IRCPacket.Prefix(some parameters);
      if ((type === 2) && (prefix.hasOwnProperty('user'))) {
        // user property에 관련된 코드
      }

  - type: Number -> type of prefix

  - serverName:String -> server name

  - nickname:String -> nickname
  - user:String -> user name
  - host:String -> host

- methods
  - parse(prefix)
    - prefix를 분석합니다
  - build()
    - 현재 Prefix 객체를 전송 할 수 있도록 String으로 반환합니다

- examples
  * var Prefix = IRCPacket.Prefix; 라고 가정합니다

  - var prefix1 = new Prefix(1, 'chat.freenode.net');
    -> prefix1 == { type: 1, serverName: 'chat.freenode.net' } // methods는 생략

  - var prefix2 = new Prefix();
    prefix2.parse('chat.freenode.net');
    -> prefix2 == { type: 1, serverName: 'chat.freenode.net' }

  - var prefix3 = new Prefix(2, 'HJH');
    -> prefix3 == { type: 2, nickname: 'HJH' }

  - var prefix4 = new Prefix(2, 'HJH', '~Hyeon');
    -> prefix4 == { type: 2, nickname: 'HJH', user: '~Hyeon' }

  - var prefix5 = new Prefix(2, 'HJH', '~Hyeon', 'localhost'); 
    -> prefix5 == { type: 2, nickname: 'HJH', user: '~Hyeon', host: 'localhost' 

  - var prefix6 = new Prefix();
    prefix6.parse('HJH!~Hyeon@localhost');
    -> prefix6 == { type: 2, nickname: 'HJH', user: '~Hyeon', host: 'localhost' }


2. Message
- constructors
  - Message([[prefix, ]command[, parameter1, parameter2, paramter3, ....]])
    - prefix: Prefix -> message의 prefix
    - command: String -> message의 command
    - parameterN: String -> message parameters

- properties
  * properties는 해당 값이 존재할 때만 객체에 저장됩니다
    즉, Message('JOIN, '#jaram')일 경우, 생성된 객체의 properties는 command, parameters만 존재합니다.
    안전한 사용을 위해서 hasOwnProperty('propertyName') method를 사용하십시오
    - example
      var message = IRCPacket.Message(some parameters);
      if (message.hasOwnProperty('prefix')) {
        // prefix property에 관련된 코드
      }

  - prefix: Prefix -> message의 prefix를 나타내는 Prefix 객체
  - command: String -> message의 command
  - parameters: Array -> message의 parameters

- methods
  - parse(message)
    - message를 분석합니다
    - message에 prefix가 포함 되어 있으면, prefix property에 Prefix 객체가 저장됩니다
  - build()
    - 현재 Message 객체를 전송 할 수 있도록 String으로 반환합니다

- examples
  * var Prefix = IRCPacket.Prefix;
    var Message = IRCPacket.Message; 라고 가정합니다

  - var message1 = new Message('JOIN');
    -> message1 == { command: 'JOIN' } // methods는 생략

  - var message2 = new Message('JOIN', '#foo');
    -> message2 == { command: 'JOIN', parameters: ['#foo'] }

  - var message3 = new Message('JOIN', '#foo', '#bar', '#something');
    -> message3 == { command: 'JOIN', parameters: ['#foo', '#bar', '#something'] }

  - var message4 = new Message(new Prefix(2, 'Hyeon', '~Hyeon', 'localhost'), 'PRIVMSG', '#foo', 'something special');
    -> message4 == { prefix: { type: 2, nickname: 'Hyeon', user: '~Hyeon', host: 'localhost' },
                     command: 'PRIVMSG', parameters: ['#foo', 'something special'] }

    message4.build() == ':Hyeon!~Hyeon@localhost PRIVMSG #foo :something special\r\n'

  - var message5 = new Message();
    message5.parse('PRIVMSG #foo :something special');
    message5 == { command: 'PRIVMSG', parameters: ['#foo', 'something special'] }

  - var message6 = new Message();
    message6.parse(':chat.freenode.net 372 Hyeon :- some messages');
    message6 == { prefix: { type: 1, serverName: 'chat.freenode.net' },
                  command: '372', parameters: '- some messages' }