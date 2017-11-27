import request from 'request-promise';
import cheerio from 'cheerio';

const uri =
	'https://streaming.lemonstream.me:1443/347e860042316f4c23f8b0bcb58958ce1511801251/127.0.0.1/playlist.m3u8?ggdomain=MTUxMTgwMTI1MQ==&ggvideo=MTUxMTgwMTI1MQ==&cookie=MTUxMTgwMTI1MQ==&link=LzkyL2FkLzkyYWQ4YWIyZGQzMDJkMjRlMzZlMTI2NGM2NTlkNGUzLTQ4MC5tcDQ=';

(async () => {
	const resp = await request({ uri, headers: { referer: 'https://yesmovies.to' } });

	console.log(resp);
})();
