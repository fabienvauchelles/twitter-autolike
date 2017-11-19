'use strict';

const ENV = process.ENV;

module.exports = {
    twitter: {
        access: {
            token: ENV.TWITTER_ACCESS_TOKEN,
            tokenSecret: ENV.TWITTER_ACCESS_TOKEN_SECRET,
        },
        consumer: {
            key: ENV.TWITTER_CONSUMER_KEY,
            secret: ENV.TWITTER_CONSUMER_SECRET,
        },
    },

    favorite: {
        delay: {
            min: parseInt(ENV.FAVORITE_DELAY_MIN || '600000'),
            max: parseInt(ENV.FAVORITE_DELAY_MAX || '86400000'),
        },
    },

    names: ENV.NAMES.split(','),
};
