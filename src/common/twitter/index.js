'use strict';

const Promise = require('bluebird'),
    EventEmitter = require('events'),
    Twit = require('twit'),
    winston = require('winston');



class Twitter extends EventEmitter {
    constructor(config) {
        super();

        this._config = config;

        this._T = new Twit({
            access_token: this._config.twitter.access.token,
            access_token_secret: this._config.twitter.access.tokenSecret,
            consumer_key: this._config.twitter.consumer.key,
            consumer_secret: this._config.twitter.consumer.secret,
            timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
        });

        this._stream = void 0;
    }


    start() {
        winston.debug('[Twitter] start()');

        return this
            ._namesToIds(this._config.names)
            .then((ids) => ids.join(','))
            .then((follow) => {
                this._stream = this._T.stream('statuses/filter', {follow});

                this._stream.on('connect', () => {
                    this.emit('connected');
                });

                this._stream.on('disconnect', () => {
                    this.emit('disconnected');
                });

                this._stream.on('tweet', (tweet) => {
                    this.emit('tweet', tweet);
                })
            })
    }


    stop() {
        winston.debug('[Twitter] stop()');

        this._stream.stop();
    }


    favorite(tweetId) {
        return new Promise((resolve, reject) => {
            const payload = {
                id: tweetId,
            };

            this._T.post('favorites/create', payload, (err, data) => {
                if (err) {
                    return reject(err);
                }

                return resolve(data);
            });
        });
    }


    _namesToIds(names) {
        const self = this;

        return Promise.map(
            names,
            (name) => lookup(name),
            { concurrency: 1 }
        );


        ////////////

        function lookup(name) {
            return new Promise((resolve, reject) => {
                const payload = {
                    screen_name: name,
                };

                self._T.get('users/lookup', payload, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!data || data.length <= 0) {
                        return reject(new Error(`No user found for ${name}`));
                    }

                    return resolve(data[0].id_str);
                });
            });
        }
    }
}


////////////

module.exports = Twitter;
