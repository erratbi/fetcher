import _ from 'lodash';
import MovieCollection from './models/MovieCollection';
import Movie from './models/Movie'
import * as actions from './helpers/yesmovies';
import { resolve } from 'path';
import fs from 'fs';


const writeToFile = (file, content) => {
	fs.writeFile(file, content, 'utf8', function (err) {
		if (err) {
			return console.log(err);
		}

		console.log('The file was saved!');
	});
};

(async () => {

	const url = 'https://yesmovies.to/movie/marvels-the-punisher-season-1-22690.html';
	const eps = await actions.getEpisodes(url);

	const tokens = await actions.getSources(url);

	console.log(tokens);
	/*
	const pages = 353;
	let data = [];
	for (let i = 253; i <= pages; i++) {
		let t0 = Date.now();
		const movies = await MovieCollection.fetch(i);
		let t1 = Date.now();
		let diff = (t1 - t0) / 1000;
		t0 = Date.now();
		let eta = (pages - i) * diff;
		data = _.concat(data, movies);
		console.log(`Page ${i} done in ${diff} s / time remaning ${eta} s`);
		writeToFile(resolve(__dirname, '../data/data6.json'), JSON.stringify(data));
	}
	*/
})();
