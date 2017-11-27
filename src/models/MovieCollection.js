import { getMoviesUrls } from '../helpers/gomovies';
import Movie from './Movie';

export default class MovieCollection {
	static async fetch(page = 1) {
		const urls = await getMoviesUrls(page);
		const movies = await Promise.all(urls.map(async url => await Movie.init(url)));

		return movies.filter(movie => !!movie);
	}
}
