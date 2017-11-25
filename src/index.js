import request from "request-promise";
import _ from "lodash";
import cheerio from "cheerio";

const getMoviesUrls = async (page = 1) => {
  const uri = `https://gostream.is/movie/filter/movie/view/all/all/all/all/hd/${page}`;

  const $ = await request({ uri, transform: body => cheerio.load(body) });

  return $(".movies-list .ml-item > a")
    .map((i, el) => $(el).attr("href"))
    .get();
};

const extractBgImage = raw => _.get(/url=(.*?)\)$/gi.exec(raw), "[1]", "");

const getMovieData = async uri => {
  const $ = await request({ uri, transform: body => cheerio.load(body) });

  return {
    url: uri,
    cover: extractBgImage($("#mv-info .mvi-cover").css("background-image")),
    poster: extractBgImage($("#mv-info .mvi-content .mvic-thumb").css("background-image")),
    title: $("#mv-info .mvic-desc h3")
      .text()
      .trim(),
    genres: $("#mv-info .mvic-info .mvici-left p")
      .eq(0)
      .find("a")
      .map((i, el) =>
        $(el)
          .text()
          .trim()
      )
      .get(),
    actors: $("#mv-info .mvic-info .mvici-left p")
      .eq(1)
      .find("a")
      .map((i, el) =>
        $(el)
          .text()
          .trim()
      )
      .get(),
    director: $("#mv-info .mvic-info .mvici-left p")
      .eq(2)
      .find("a")
      .map((i, el) =>
        $(el)
          .text()
          .trim()
      )
      .get(),
    country: $("#mv-info .mvic-info .mvici-left p")
      .eq(3)
      .find("a")
      .map((i, el) =>
        $(el)
          .text()
          .trim()
      )
      .get(),
    duration: $("#mv-info .mvic-info .mvici-right p")
      .eq(0)
      .text()
      .replace(/[^\d]/gi, ""),
    quality: $("#mv-info .mvic-info .mvici-right p span.quality")
      .text()
      .trim(),
    year: $("#mv-info .mvic-info .mvici-right p")
      .eq(2)
      .text()
      .replace(/[^\d]/gi, ""),
    imdb: $("#mv-info .mvic-info .mvici-right p")
      .eq(3)
      .text()
      .replace(/[^\d|^\.]/gi, ""),
    keywords: $("#mv-keywords a")
      .map((i, el) =>
        $(el)
          .text()
          .trim()
      )
      .get(),
    trailer: _.get(
      /"(https:\/\/www.youtube.com\/embed\/.+?)"/gi.exec(
        $(".modal-trailer")
          .next("script")
          .html()
      ),
      "[1]",
      ""
    ),
    sources: await getSources(uri)
  };
};

const getMovieId = url => _.get(/-(\d+?)\/?$/.exec(url), "[1]", "");

const getEpisodes = async url => {
  const mid = getMovieId(url);
  const uri = `https://gostream.is/ajax/movie_episodes/${mid}`;
  const resp = await request({ uri, json: true });
  const $ = cheerio.load(resp.html);
  return $(".btn-eps.ep-item")
    .map((i, el) => $(el).data("id"))
    .get();
};

const getMovieToken = async (mid, eid) => {
  const uri = `https://gostream.is/ajax/movie_token?eid=${eid}&mid=${mid}`;
  const resp = await request.get(uri);
  const x = _.get(/_x='(.+?)'/gi.exec(resp), "[1]", "");
  const y = _.get(/_y='(.+?)'/gi.exec(resp), "[1]", "");
  return { eid, x, y };
};

const getMovieTokens = async url => {
  const mid = getMovieId(url);
  const episodes = await getEpisodes(url);
  return Promise.all(episodes.map(async eid => await getMovieToken(mid, eid)));
};

const getSources = async url => {
  const tokens = await getMovieTokens(url);
  const sources = await Promise.all(
    tokens.map(async ({ eid, x, y }) => {
      const uri = `https://gostream.is/ajax/movie_sources/${eid}?x=${x}&y=${y}`;
      const data = await request({ uri, json: true });
      return data;
    })
  );

  return sources.filter(source => !!source);
};

(async () => {
  const urls = await getMoviesUrls(3);

    const sources = await getSources(urls[5]);

    console.log(_.get(sources, "[0].playlist[0].sources", null));
  //console.log(await getMovieData('https://gostream.is/film/rogue-one-a-star-wars-story-18429/'));
})();
