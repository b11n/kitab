const assert = require('assert').strict;
const getBookInfo = require('../index.js');

const eventObj = {
    "queryStringParameters": {
        "isbn": "9789350232385"
    },
};

describe('getFullUrl', () => {
    it('should return baseurl when query object is empty', () => {
        const res = getBookInfo.getFullUrl("https://www.google.com", {});
        assert.equal(res, "https://www.google.com")
    });

    it('should return correct url when obj is not empty', () => {
        const res = getBookInfo.getFullUrl("https://www.google.com", {
            q: "foo",
            bar: "baz",
        });
        assert.equal(res, "https://www.google.com?q=foo&bar=baz");
    })

})

