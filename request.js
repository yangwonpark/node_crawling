const request = require('request');

const url = "https://www.naver.com";

request(url, (err, res, body) => {
    console.log(body);
});