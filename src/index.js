'use strict';

const
    winston = require('winston');

const
    Twitter = require('./common/twitter');

winston.level = 'debug';

const config = require('./config');



const twitter = new Twitter(config);

process.on('SIGINT', () => {
    twitter.stop();
});

twitter.on('connected', () => {
    winston.info('[Main] connected');
});

twitter.on('disconnected', () => {
    winston.error('[Main] disconnected');
});

twitter.on('tweet', (tweet) => {
    winston.info('[Main] Like: (%s) %s', tweet.user.name, tweet.text);

    const delay = config.favorite.delay.min
        + Math.floor(Math.random() * (config.favorite.delay.max - config.favorite.delay.min));

    setTimeout(() => {
        twitter.favorite(tweet.id_str)
            .then((tweet_followed) => {
                winston.info('[Main] Liked: (%s) %s', tweet_followed.user.name, tweet_followed.text);
            })
            .catch((err) => {
                winston.error('Error: ', err);
            });
    }, delay);
});


winston.info('[Twitter] Listening users: %s', config.names);
twitter
    .start()
    .catch((err) => {
        winston.error('Error:', err)
    })
;
