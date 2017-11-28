jwplayer.key = 'r/viHfrthMvlepAj1LfUPgiRYNSo17HhByHoAIZ4D0s=';
var loc = window.location;
var temp = loc.pathname.split('/');
tmp = temp[3].split('-');
var eid = tmp[0];
var sv = tmp[1];
tmp2 = temp[2].split('-');
var mid = tmp2[tmp2.length - 1];
var first_load = true,
	player_ready = false,
	playlist,
	player = jwplayer('media-player'),
	sv_error = [],
	sv_default = 8,
	eb_default = 14,
	auto_next = true,
	player_settings = {},
	ad_is_shown = false,
	rlcnt = 0,
	setup_error = false,
	seeked = false;
function get_episodes() {
	$.ajax({
		url: '/ajax/v4_movie_episodes/' + mid,
		method: 'GET',
		dataType: 'json',
		async: false,
		success: function (resp) {
			$('.pa-server').html(resp.html);
		}
	});
}
function setup_player() {
	player_ready = true;
	var config = {
		playlist: playlist,
		allowfullscreen: true,
		width: '100%',
		height: '500px',
		autostart: true,
		cast: {},
		captions: {
			color: '#f3f378',
			fontSize: 16,
			backgroundOpacity: 0,
			fontfamily: 'Helvetica',
			edgeStyle: 'raised'
		},
		skin: {
			active: '#c91c54',
			inactive: 'white',
			background: 'black'
		}
	};
	player.setup(config);
	player.on('setupError', function (data) {
		setup_error = true;
		player_error();
	});
	player.on('ready', function () {
		player_ready = true;
		setup_error = false;
		var web = custombanner.mobileChecker();
		if (!web) {
			$('#media-player').prepend('<div id="overlay-yesplugin-main" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"></div>');
		}
	});
	player.on('complete', function () {
		if (auto_next && $('#episodes-sv-' + sv + ' .ep-item').length > 1) {
			var ep_index = get_ep_index();
			if (ep_index > 0) {
				ep_index -= 1;
				$('#episodes-sv-' + sv + ' .ep-item[data-index=' + ep_index + ']').click();
			}
		}
	});
	player.on('play', function () {
		sv_error = [];
	});
	player.on('levels', function () {
		var quality = player.getQualityLevels()[0];
		if (quality.label === 'Auto') {
			player.setCurrentQuality(0);
		}
	});
	player.on('seek', function (data) {
		sv_error = [];
		seeked = true;
		localStorage.setItem(eid, data.offset);
	});
	player.on('firstFrame', function () {
		if (first_load && localStorage.getItem(eid) && localStorage.getItem(eid) > 30) {
			if (seeked) {
				player.seek(localStorage.getItem(eid));
				seeked = false;
			} else {
				player.pause();
				$('#time-resume').text(convert_time(localStorage.getItem(eid)));
				$('#pop-resume').modal('show');
			}
			first_load = false;
		}
	});
	player.on('time', function () {
		var web = custombanner.mobileChecker();
		if (!web) {
			var adTime = custombanner.adTime();
			if (parseInt(player.getPosition()) === adTime.start && !ad_is_shown) {
				custombanner.addTag();
				ad_is_shown = true;
			}
			if (parseInt(player.getPosition()) === adTime.end && ad_is_shown) {
				custombanner.removeTag();
			}
		}
	});
	player.on('error', function (data) {
		setup_error = true;
		if (seeked) {
			get_sources();
		} else {
			if (parseInt(sv) === 5 && rlcnt < 3) {
				player.load(playlist);
				rlcnt += 1;
			} else {
				player_error();
			}
		}
	});
}
function player_error() {
	if (sv_error.indexOf(sv) < 0) {
		sv_error.push(parseInt(sv));
	}
	var onError = false;
	$('.server-item.vip').each(function (i) {
		if (sv_error.indexOf(parseInt($(this).attr('data-id'))) < 0) {
			sv = $(this).attr('data-id');
			onError = true;
			$(this).click();
			$('#episodes-sv-' + sv + ' .ep-item[data-index=' + get_ep_index() + ']').click();
			return false;
		}
	});
	if (!onError) {
		load_embed();
	}
}
function load_server() {
	if ($('#sv-' + sv_default).length > 0) {
		sv = sv_default;
		$('#sv-' + sv_default).click();
	} else {
		$('.server-item').each(function (i) {
			if (i == 0) {
				sv = $(this).attr('data-id');
				$(this).click();
			}
		});
	}
	var index = $('#episodes-sv-' + sv + ' .ep-item').length - 1;
	$('#episodes-sv-' + sv + ' .ep-item[data-index=' + index + ']').click();
	$('.server-item').addClass('sv-loaded');
}
function load_embed() {
	if ($('#sv-' + eb_default).length > 0) {
		sv = eb_default;
		$('#sv-' + eb_default).click();
	} else {
		$('.server-item.embed').each(function (i) {
			if (i == 0) {
				sv = $(this).attr('data-id');
				$(this).click();
			}
		});
	}
	$('#episodes-sv-' + sv + ' .ep-item[data-index=' + get_ep_index() + ']').click();
}
function get_ep_index() {
	return parseInt($('#ep-' + eid).attr('data-index'));
}
function convert_time(mySeconds) {
	var time = new Date(0, 0, 0);
	time.setSeconds(+mySeconds);
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var seconds = time.getSeconds();
	return (
		(hours < 10 ? '0' + hours : hours) +
		':' +
		(minutes < 10 ? '0' + minutes : minutes) +
		':' +
		(seconds < 10 ? '0' + seconds : seconds)
	);
}
$('#yes-resume').click(function () {
	$('#pop-resume').modal('hide');
	player.seek(localStorage.getItem(eid));
});
$('#no-resume').click(function () {
	$('#pop-resume').modal('hide');
	player.play();
});
function get_sources() {
	if (player_ready) {
		player_ready = false;
		player.stop();
	}
	first_load = true;
	$.getScript('/ajax/movie_token?eid=' + eid + '&mid=' + mid, function () {
		$.ajax({
			url: '/ajax/movie_sources/' + eid + '?x=' + _x + '&y=' + _y,
			method: 'GET',
			dataType: 'json',
			success: function (resp) {
				if (resp.embed) {
					if (WebTorrent.WEBRTC_SUPPORT) {
						$('#content-embed').show();
						$('#media-player').hide();
						player.stop();
						$('#embed-loading').hide();
						$('#iframe-embed').attr('src', resp.src);
					} else {
						player_error();
					}
				} else {
					$('#iframe-embed').attr('src', '');
					playlist = resp.playlist;
					if (player_ready && !setup_error) {
						player.load(playlist);
					} else {
						setup_player();
					}
				}
			}
		});
	});
}
function get_embed() {
	$.ajax({
		url: '/ajax/movie_embed/' + eid,
		method: 'GET',
		dataType: 'json',
		success: function (resp) {
			$('#embed-loading').hide();
			$('#iframe-embed').attr('src', resp.src);
		}
	});
}
$(document).on('click', '.server-item', function () {
	var server_id = $(this).attr('data-id');
	$('.server-item').removeClass('active');
	$(this).addClass('active');
	$('.server-list-item').hide();
	$('#episodes-sv-' + server_id).show();
	$('.playing-on').text(
		$(this).text().trim()
	);
});
$(document).on('click', '.sv-loaded', function () {
	sv = $(this).attr('data-id');
	if ($('#episodes-sv-' + sv + ' .ep-item').length == 1) {
		$('#episodes-sv-' + sv + ' .ep-item').click();
	}
});
function change_url() {
	var url =
		loc.protocol + '//' + loc.hostname + '/movie/' + temp[2] + '/' + eid + '-' + sv + '/watching.html';
	history.pushState({}, '', url);
}
$('.bp-btn-auto').click(function () {
	if (auto_next) {
		auto_next = false;
		$(this).removeClass('active');
	} else {
		auto_next = true;
		$(this).addClass('active');
	}
	player_settings.auto_next = auto_next;
	$.cookie('player_settings', JSON.stringify(player_settings), {
		expires: 365
	});
});
$(document).on('click', '.ep-item', function () {
	eid = $(this).attr('data-id');
	sv = $(this).attr('data-server');
	$('.ep-item').removeClass('active');
	$('#ep-' + eid).addClass('active');
	if ($('#sv-' + sv).hasClass('embed')) {
		$('#media-player').hide();
		$('#content-embed').show();
		player.stop();
		get_embed();
	} else {
		$('#media-player').show();
		$('#content-embed').hide();
		get_sources();
	}
	change_url();
});
$(document).ready(function () {
	get_episodes();
	if ($.cookie('player_settings')) {
		player_settings = JSON.parse($.cookie('player_settings'));
		auto_next = player_settings.auto_next;
	}
	if (!auto_next) {
		$('.bp-btn-auto').removeClass('active');
	}
	if (temp.length < 5) {
		load_server();
	} else {
		if ($('#ep-' + eid).length > 0 && $('#sv-' + sv).length > 0) {
			$('#sv-' + sv).click();
			$('#ep-' + eid).click();
		} else {
			window.location.href = loc.protocol + '//' + loc.hostname + '/movie/' + temp[2] + '.html';
		}
		$('.server-item').addClass('sv-loaded');
	}
});
