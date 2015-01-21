'use strict';

var winston = require('winston'),
    env = process.env.NODE_ENV || 'development';


var name = 'OaaS';

var config = {
    levels: {
        silly: 0,
        verbose: 1,
        info: 2,
        data: 3,
        warn: 4,
        debug: 5,
        error: 6
    },
    colors: {
        silly: 'magenta',
        verbose: 'cyan',
        info: 'green',
        data: 'grey',
        warn: 'yellow',
        debug: 'blue',
        error: 'red'
    }
};
var options = {
    colorize: true
};

// winston.remove(winston.transports.Console);
// winston.add(winston.transports.Console, options)

var logger = {
    development: new(winston.Logger)({
        transports: [
            new(winston.transports.Console)(options),
            new(winston.transports.File)({
                filename: '../logs/' + name + '.development.log'

            })
        ],
        levels: config.levels,
        colors: config.colors
    }),

    test: new(winston.Logger)({
        transports: [
            new(winston.transports.File)({
                filename: '../logs/' + name + '.test.log'
            })
        ]
    }),

    production: new(winston.Logger)({
        transports: [
            new(winston.transports.Console)(),
            new(winston.transports.File)({
                filename: '../logs/' + name + '.production.log',
                json: true,
                maxsize: 5242880 //5MB
            })
        ]
    })
};

module.exports = logger[env];