/**
 * @file entry
 * @author test
 */

'use strict';

export default {
    config: {
        pages: [
            'pages/home/index'
        ],

        window: {
            navigationBarBackgroundColor: '#54DAC0',
            navigationBarTextStyle: 'white',
            backgroundTextStyle: 'light',
            enablePullDownRefresh: false,
            backgroundColor: '#54DAC0'
        },

        networkTimeout: {
            request: 30000
        }
    }
};

