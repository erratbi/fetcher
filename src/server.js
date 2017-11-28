import express from 'express';
import request from 'request-promise';
import fs from 'fs';
import { resolve } from 'path';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/:title', async (req, res) => {
	const { title } = req.params;



	return res.render('index', {
		playlist: [{ "sources": [{ "label": "720p", "type": "video/mp4", "file": "https://openload.co/embed/G7K_MRhci4k/The.Toymaker.2017.1080p.WEB-DL.DD5.1.H264-FGT.mp4" }], "tracks": [] }]
	});

});

app.listen(3000, () => console.log('Server running on port 3000'));
