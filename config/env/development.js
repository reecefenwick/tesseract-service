/**
 * development.js
 *
 * @description :: This is the configuration file for the servers with NODE_ENV of 'development'
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    mq: {
        host: 'amqp://localhost',
        channel: 'OCR',
        options: {
            durable: false,
            noAck: false,
            prefetch: 2
        }
    },
    db: {
        host: 'mongodb://localhost',
        port: 27017,
        name: 'ocr'
    }
};
