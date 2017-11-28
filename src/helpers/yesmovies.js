import request from 'request-promise';
import _ from 'lodash';
import cheerio from 'cheerio';



export const getMovieId = url => _.get(/-(\d+?)\.html$/.exec(url), '[1]', '');

export const getEpisodes = async url => {
  const mid = getMovieId(url);
  const uri = `https://yesmovies.to/ajax/v4_movie_episodes/${mid}`;
  const resp = await request({ uri, json: true });
  if (!resp || !resp.html) return;
  const $ = cheerio.load(resp.html);
  return $('li.ep-item').map((i, el) => ({ eid: $(el).data('id'), server: $(el).data('server') })).get();
};



export const getMovieToken = async (mid, eid, server) => {
  const uri = `https://yesmovies.to/ajax/movie_token?eid=${eid}&mid=${mid}`;
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
        const embed = await request({ uri: `https://yesmovies.to/ajax/movie_embed/${eid}`, json: true });
        if (embed && embed.src) return { server, src: embed.src, embed: true }
      } else {
        try {

          const uri = `https://yesmovies.to/ajax/movie_sources/${eid}?x=${x}&y=${y}`;
          const data = await request({ uri, json: true })
          if (!data || JSON.stringify(data).includes('File not found.')) return;
          return _.extend({ server }, data);
        } catch (error) {
          return null;
        }
      }
    })
  );

  console.log(url);

  return sources.filter(source => !!source);
};


export const getMoviesUrls = async (page = 1) => {
  const uri = `https://yesmovies.to/movie/filter/movie/latest/all/all/all/all/all/page-${page}.html`;

  try {
    const $ = await request({ uri, transform: body => cheerio.load(body) });
    return $('.movies-list .ml-item > a').map((i, el) => $(el).attr('href')).get();
  } catch (error) {
    return null;
  }

};