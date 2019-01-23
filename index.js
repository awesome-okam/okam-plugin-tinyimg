/**
 * @file The tinyimg processor
 */

'use strict';

const TinyImg = require('./lib/TinyImg');

function shouldIgnore(path) {
    return path.indexOf('node_modules') !== -1;
}

module.exports = function (file, options) {
    let {ignore} = options;
    ignore || (ignore = shouldIgnore);

    if (ignore(file.path)) {
        return {
            content: file.content
        };
    }

    const tinyImgIns = new TinyImg(file, options);

    return tinyImgIns.compress();
};
