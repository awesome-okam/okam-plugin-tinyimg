/**
 * @file Build swan smart program config
 * @author test
 */

'use strict';

const path = require('path');
const rider = require('rider');

module.exports = {
    verbose: true,
    root: path.join(__dirname, '..'),
    output: {
        dir: 'dist',
        depDir: 'src/common'
    },
    component: {
        extname: 'okm'
    },
    framework: [
        'data',
        'broadcast',
        'ref'
    ],
    processors: {
        babel: {
            extnames: ['js']
        },
        stylus: {
            options: {
                use(style) {
                    style.use(rider());
                }
            }
        },
        postcss: {
            options: {
                plugins: {
                    px2rpx: {
                        designWidth: 1242
                    }
                }
            }
        }
    },
    rules: [
        {
            match: '*.styl',
            processors: ['postcss']
        },
        {
            match: /\.(png|jpe?g|gif)(\?.*)?$/,
            processors: {
                tinyimg: {
                    replaceRaw: true
                }
            }
        }
    ]
};
