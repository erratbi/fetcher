import request from 'request-promise';
import _ from 'lodash';
import cheerio from 'cheerio';
import { getRawUrl } from "./sandbox";

const getMovieData = async (url) => {
    const uri = url.replace(/\/$/, "");
    const $ = await request({ uri, transform: body => cheerio.load(body)});

    return {
        slug: _.last(uri.split('/')),
        source: await getRawUrl(uri),
        poster: $('.body-content .single-poster-img meta').attr('content'),
        cover: $('.body-content .single-cover img').attr('src'),
        title: $('.body-content .single-title meta').attr('content'),
        duration: $('.body-content .item-duration').text().trim(),
        imdb: $('.body-content [itemprop="ratingValue"]').attr('content'),
        description: $('.body-content .single-description p').text().trim(),
        quality: $('.body-content .item-details p').eq(0).find('span.item-value').text().trim(),
        country: $('.body-content .item-details p').eq(1).find('span.item-value').text().trim(),
        language: $('.body-content .item-details p').eq(2).find('span.item-value').text().trim(),
        budget: $('.body-content .item-details p').eq(3).find('span.item-value').text().trim().replace(/[^\d]/gi, ''),
        directors: $('.body-content .item-details p').eq(4).find('a').map((i, el) => $(el).text()).get(),
        actors: $('#cast .credit_image_block img').map((i, el) => ({name: $(el).attr('alt'), image: $(el).attr('src')}) ).get(),
        directors: $('#director .credit_image_block img').map((i, el) => ({name: $(el).attr('alt'), image: $(el).attr('src')}) ).get(),
        trailer: $('iframe.youtube_trailers').eq(0).attr('src'),
        keyword: $('.search-terms span').map((i, el) => $(el).text().trim()).get()
    }
}

(async () => {
    console.log(await getMovieData('https://hd-arab.com/american-made/'));
})()