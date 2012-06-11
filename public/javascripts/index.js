$(document).ready(function () {
  var patterns = {
    nickname: /^[a-zA-Z0-9\[\]\\\`\_\^\{\|\}\-]{1,16}$/,
    channel: /^[\&\#\+\!]?[^\#\x20\x07\,][^\x20\x07\,]{0,49}$/
  };

  var $nickname = $('#nickname');
  var $channel = $('#channel');
  var $helpBlock = $('.help-block');

  $nickname
    .focus(function () {
      $helpBlock.hide();
      $nickname.next().show();
    })

    .bind('keyup mouseup change', function () {
      var $help = $nickname.next();
      var $controlGroup = $help.parents('.control-group').removeClass('error success');
      
      if ($nickname.val() === '') {
        $help.text('사용할 닉네임을 입력해주세요');
      } else  if ($nickname.val().match(patterns.nickname)) {
        $controlGroup.removeClass('error success').addClass('success');
        $help.text('다음으로 넘어가셔도 좋습니다');
      }else {
        $controlGroup.removeClass('error success').addClass('error');
        $help.html('닉네임은 숫자로 시작할 수 없으며, 영문, 숫자,<br /> 그리고 특수문자(-_[]\`^{}|)만 사용 가능합니다');
      }
    })
    
    .blur(function () {
      $helpBlock.hide();
    });
    
  $channel
    .focus(function () {
      $helpBlock.hide();
      $channel.next().show();
    })

    .bind('keyup mouseup change', function () {
      var $help = $channel.next();
      var $controlGroup = $help.parents('.control-group').removeClass('error success');
      
      if ($channel.val() === '') {
        $help.text('입장할 채널을 입력해주세요');
      } else  if ($channel.val().match(patterns.channel)) {
        $controlGroup.removeClass('error success').addClass('success');
        $help.text('다음으로 넘어가셔도 좋습니다');
      }else {
        $controlGroup.removeClass('error success').addClass('error');
        $help.text('채널은 공백과 콤마 이외의 문자로 이루어져 있습니다');
      }
    })
    
    .blur(function () {
      var channel = $channel.val();
      if ((channel !== '') && (channel.charAt(0) !== '#')) $channel.val('#' + channel);
      $helpBlock.hide();
    });

  var cookies = (function () {
    var items = document.cookie.split(/;\s+/g);
    var position = 0;
    var result = { };
    for (var i = 0, length = items.length; i < length; i++) {
      position = items[i].indexOf('=');

      result[items[i].substr(0, position)] = unescape(items[i].substr(position + 1));
    }

    return result;
  })();


  $('#connect').submit(function () {
    if ($nickname.val().match(patterns.nickname) === null) {
      $nickname.focus();
      return false;
    }
    
    var channel = $channel.val();
    if ((channel !== '') && (channel.charAt(0) !== '#')) $channel.val('#' + channel);
    
    if ($channel.val().match(patterns.channel) === null) {
      $channel.focus();
      return false;
    }
    
    document.cookie = 'nickname=' + escape($nickname.val());
    document.cookie = 'channel=' + escape($channel.val());


    return true;
  });

  if (cookies.hasOwnProperty('nickname')) $nickname.val(cookies.nickname).change().blur();
  if (cookies.hasOwnProperty('channel')) $channel.val(cookies.channel).change().blur();
		      
		      
//notification
  window.webkitNotifications.requestPermission();

});

