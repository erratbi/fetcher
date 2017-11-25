import request from 'request';
import express from 'express';
import rp from 'request-promise';
import _ from 'lodash';
import cheerio from 'cheerio';

export const slugify = text => text
           .toString()
           .toLowerCase()
           .replace(/\s+|'/g, "-") // Replace spaces with -
           .replace(/[^\w\-]+/g, "") // Remove all non-word chars
           .replace(/\-\-+/g, "-") // Replace multiple - with single -
           .replace(/^-+/, "") // Trim - from start of text
           .replace(/-+$/, ""); // Trim - from end of text


export const getRawUrl = async (uri) => {
    const jq = await rp({ uri, transform: body => cheerio.load(body)});
    const rawUrl = jq("#player_1 iframe").data('src');
    const $ = await rp({ uri: rawUrl, transform: body => cheerio.load(body)});
    console.log($('*').html());
    return _.get(/\[{"file":"(.+?)",/gi.exec($('#video_player').next('script').html()), '[1]', '');
}

export const getStreamUrl = async (uri, cb) => {
    const url = await getRawUrl(uri); 
    return request({
        url,
        followRedirect: false
    }, (err, resp) => {
        return cb(resp.headers.location);
    });
}