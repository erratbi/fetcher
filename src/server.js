import express from 'express';
import request from 'request-promise';
import fs from 'fs';
import { resolve } from 'path';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/:title', async (req, res) => {
	const { title } = req.params;

	const uri =
		'https://streaming.lemonstream.me:1443/347e860042316f4c23f8b0bcb58958ce1511801251/127.0.0.1/playlist.m3u8?ggdomain=MTUxMTgwMTI1MQ==&ggvideo=MTUxMTgwMTI1MQ==&cookie=MTUxMTgwMTI1MQ==&link=LzkyL2FkLzkyYWQ4YWIyZGQzMDJkMjRlMzZlMTI2NGM2NTlkNGUzLTQ4MC5tcDQ=';

	const resp = await request({ uri, headers: { referer: 'https://yesmovies.to' } });

	if (resp) {
		//fs.writeFileSync(resolve(__dirname, '../public/tmp/playlist.m3u8'), resp);
		return res.render('index', {
			file: '/src/tmp/playlist.m3u8'
		});
	} else res.send('Not found');
});

app.listen(3000, () => console.log('Server running on port 3000'));
