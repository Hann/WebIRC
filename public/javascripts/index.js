(function ($) {
	$(document).ready(function () {
		$('#nickname')
			.focus(function () {
				$('.help-block')
					.hide()
					.filter('#help-of-nickname')
					.show();
			})

			.bind('keyup mouseup change', function () {
				var $this = $(this);
				var $help = $this.nextAll('#help-of-nickname');
				var $controlGroup = $help.parents('.control-group').removeClass('error success');
				
				if ($this.val() === '') {
					$help.text('사용할 닉네임을 입력해주세요');
				} else  if ($this.val().match(/^[a-zA-Z\-\_\[\]\\\`\^\{\}\|][a-zA-Z\-\_\[\]\\\`\^\{\}\|0-9]*$/)) {
					$controlGroup.removeClass('error success').addClass('success');
					$help.text('다음으로 넘어가셔도 좋습니다');
				}else {
					$controlGroup.removeClass('error success').addClass('error');
					$help.html('닉네임은 숫자로 시작할 수 없으며, 영문, 숫자,<br /> 그리고 특수문자(-_[]\`^{}|)만 사용 가능합니다');
				}
			})
			
			.blur(function () {
				$('.help-block').hide();
			});
			
		$('#channel')
			.focus(function () {
				$('.help-block')
					.hide()
					.filter('#help-of-channel')
					.show();
			})

			.bind('keyup mouseup change', function () {
				var $this = $(this);
				var $help = $this.nextAll('#help-of-channel');
				var $controlGroup = $help.parents('.control-group').removeClass('error success');
				
				if ($this.val() === '') {
					$help.text('입장할 채널을 입력해주세요');
				} else  if ($this.val().match(/^[&#]?[^\x20\x07\,]+$/)) {
					$controlGroup.removeClass('error success').addClass('success');
					$help.text('다음으로 넘어가셔도 좋습니다');
				}else {
					$controlGroup.removeClass('error success').addClass('error');
					$help.text('채널은 공백과 콤마 이외의 문자로 이루어져 있습니다');
				}
			})
			
			.blur(function () {
				$('.help-block').hide();
			});
	})
})(jQuery);