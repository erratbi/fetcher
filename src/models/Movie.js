import { getMovieData } from '../helpers/gomovies';

export default class Movie {
	constructor(obj) {
		Object.keys(obj).map(key => {
			this[key] = obj[key];
		});
	}

	static async init(uri) {
		const obj = await getMovieData(uri);
		if (!obj) return;
		return new Movie(obj);
	}
}
