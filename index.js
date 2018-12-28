const request = require('axios');
const to_json = require('xmljson').to_json;
const querystring = require('querystring');

const GOOD_READS_URI = "https://www.goodreads.com/search/index.xml";
const GOOGLE_BOOKS_BASE_URI = "https://www.googleapis.com/books/v1/volumes";

const GOOD_READS_API_KEY = process.env.GOOD_READS_API_KEY;

exports.getFullUrl = getFullUrl;
exports.handler = function (event, context, callback) {
    getGoodReadsResp(event["queryStringParameters"]['isbn'])
        .then(getDataFromAxiosResponse)
        .then(xmlToJson)
        .then(processGoodReadsResponse)
        .then(googleResponse)
        .then(getDataFromAxiosResponse)
        .then((d) => {
            var response = {
                "statusCode": 200,
                "headers": {},
                "body": JSON.stringify(d.items[0]),
                "isBase64Encoded": false
            };
            callback(null, response);
        });
};



function getGoodReadsResp(isbn) {
    const uri = getFullUrl(GOOD_READS_URI, {
        q: isbn,
        key: GOOD_READS_API_KEY,
    });
    return request.get(uri);
}

function getDataFromAxiosResponse(axiosResponse) {
    return new Promise((resolve, reject) => {
        resolve(axiosResponse.data);
    });
}

function xmlToJson(xmlString) {
    return new Promise(function (resolve, reject) {
        to_json(xmlString, function (error, data) {
            if (error) reject();
            resolve(data);
        });
    });

}

function processGoodReadsResponse(grResponse) {
    const resp = {};
    resp['year'] = grResponse.GoodreadsResponse.search.results.work.original_publication_year;
    resp['title'] = grResponse.GoodreadsResponse.search.results.work.best_book.title;
    resp['author'] = grResponse.GoodreadsResponse.search.results.work.best_book.author.name;
    resp['rating'] = grResponse.GoodreadsResponse.search.results.work.average_rating;
    return new Promise((re, rj) => {
        re(resp);
    });

}

function googleResponse(grResp) {
    const { title, author } = grResp;
    const uri = getFullUrl(GOOGLE_BOOKS_BASE_URI, {
        q: title + ' ' + author,
    });
    return request.get(uri);
}

function getFullUrl(baseurl, queryObj) {
    const numParams = Object.keys(queryObj).length;
    if (numParams === 0) return baseurl;
    return baseurl + "?" + querystring.stringify(queryObj);
}