/**
 * @file tinyimg
 */

'use strict';

const request = require('request');

function tinypng(fileContent, callback) {
    request({
        url: 'https://tinypng.com/web/shrink',
        method: 'post',
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'tinypng.com',
            'DNT': 1,
            'Referer': 'https://tinypng.com/',
            'User-Agent': 'Mozilla/5.0'
        },
        body: fileContent
    }, function (error, response, body) {
        if (error) {
            callback('compress img error');
            return;
        }

        let result = JSON.parse(body);
        let output = result.output;

        if (!output || !output.url) {
            callback('compress success, output or url not exist');
            return;
        }

        request.get({url: output.url, encoding: null}, function (err, res, body) {
            if (err) {
                callback('compress success, get img error');
                return;
            }

            callback(null, {
                file: new Buffer(body),
                input: result.input,
                output: output
            });
        });
    });
}

module.exports = tinypng;
