/**
 * @file The tinyimg processor
 */

'use strict';

const TinyImg = require('./lib/TinyImg');

module.exports = function (file, options) {
    const tinyImgIns = new TinyImg(file, options);

    return tinyImgIns.compress();
};
