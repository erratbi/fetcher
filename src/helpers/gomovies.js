import request from 'request-promise';
import _ from 'lodash';
import cheerio from 'cheerio';

export const getMoviesUrls = async (page = 1) => {
	const uri = `https://gostream.is/movie/filter/movie/view/all/all/all/all/hd/${page}`;

	const $ = await request({ uri, transform: body => cheerio.load(body) });

	return $('.movies-list .ml-item > a')
		.map((i, el) => $(el).attr('href'))
		.get();
};

export const extractBgImage = raw => _.get(/url=(.*?)\)$/gi.exec(raw), '[1]', '');

export const getMovieData = async uri => {
	const $ = await request({ uri, transform: body => cheerio.load(body) });
	const sources = await getSources(uri);
	if (!sources) return;


	const type = $('#mv-info .mvic-info .mvici-right p').eq(0).find('strong').text().trim() === 'Episode:' ? 'Show' : 'Movie';
	const wildcard = $('#mv-info .mvic-info .mvici-right p').eq(0).text().trim().replace(/[^\d|/]/gi, '');

	return {
		url: uri,
		type,
		cover: extractBgImage($('#mv-info .mvi-cover').css('background-image')),
		poster: extractBgImage($('#mv-info .mvi-content .mvic-thumb').css('background-image')),
		title: $('#mv-info .mvic-desc h3')
			.text()
			.trim(),
		genres: $('#mv-info .mvic-info .mvici-left p')
			.eq(0)
			.find('a')
			.map((i, el) =>
				$(el)
					.text()
					.trim()
			)
			.get(),
		actors: $('#mv-info .mvic-info .mvici-left p')
			.eq(1)
			.find('a')
			.map((i, el) =>
				$(el)
					.text()
					.trim()
			)
			.get(),
		director: $('#mv-info .mvic-info .mvici-left p')
			.eq(2)
			.find('a')
			.map((i, el) =>
				$(el)
					.text()
					.trim()
			)
			.get(),
		country: $('#mv-info .mvic-info .mvici-left p')
			.eq(3)
			.find('a')
			.map((i, el) =>
				$(el)
					.text()
					.trim()
			)
			.get(),
		duration: type === 'Movie' ? wildcard : null,
		episodes: type === 'Show' ? wildcard : null,
		quality: $('#mv-info .mvic-info .mvici-right p span.quality')
			.text()
			.trim(),
		year: $('#mv-info .mvic-info .mvici-right p')
			.eq(2)
			.text()
			.replace(/[^\d]/gi, ''),
		imdb: $('#mv-info .mvic-info .mvici-right p')
			.eq(3)
			.text()
			.replace(/[^\d|^\.]/gi, ''),
		keywords: $('#mv-keywords a')
			.map((i, el) =>
				$(el)
					.text()
					.trim()
			)
			.get(),
		trailer: _.get(
			/"(https:\/\/www.youtube.com\/embed\/.+?)"/gi.exec(
				$('.modal-trailer')
					.next('script')
					.html()
			),
			'[1]',
			''
		),
		sources
	};
};

export const getMovieId = url => _.get(/-(\d+?)\/?$/.exec(url), '[1]', '');

export const getEpisodes = async url => {
	const mid = getMovieId(url);
	const uri = `https://gostream.is/ajax/movie_episodes/${mid}`;
	const resp = await request({ uri, json: true });
	if (!resp || !resp.html) return;
	const $ = cheerio.load(resp.html);
	return $('.btn-eps.ep-item')
		.map((i, el) => ({ eid: $(el).data('id'), server: $(el).data('server') }))
		.get();
};

export const getMovieToken = async (mid, eid, server) => {
	const uri = `https://gostream.is/ajax/movie_token?eid=${eid}&mid=${mid}`;
	const resp = await request.get(uri);
	const x = _.get(/_x='(.+?)'/gi.exec(resp), '[1]', '');
	const y = _.get(/_y='(.+?)'/gi.exec(resp), '[1]', '');
	return { eid, x, y, server };
};

export const getMovieTokens = async url => {
	const mid = getMovieId(url);
	const episodes = await getEpisodes(url);
	if (!episodes) return;
	return Promise.all(episodes.map(async ({ eid, server }) => await getMovieToken(mid, eid, server)));
};

export const getSources = async url => {
	const tokens = await getMovieTokens(url);
	if (!tokens) return;
	const sources = await Promise.all(
		tokens.map(async ({ eid, x, y, server }) => {
			if (server === 7 || server === 6) return;
			if (server === 14) {
				const embed = await request({ uri: `https://gostream.is/ajax/movie_embed/${eid}`, json: true });
				if (embed && embed.src) return { server, src: embed.src, embed: true }
			} else {
				const uri = `https://gostream.is/ajax/movie_sources/${eid}?x=${x}&y=${y}`;
				const data = await request({ uri, json: true });
				if (!data || JSON.stringify(data).includes('File not found.')) return;
				return _.extend({ server }, data);
			}
		})
	);

	console.log(url);

	return sources.filter(source => !!source);
};
