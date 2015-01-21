/**
 * mq.js
 *
 * @description :: This library is for a standard interface to the message queue
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

// Load dependencies
var amqp = require('amqplib/callback_api');

module.exports = {
    addmessage: function(message, callback) {

        function bail(err, conn) {
            console.log(err);
            if (conn) conn.close(function() {
                callback(err)
            });
        }

        function on_connect(err, conn) {
            if (err) return bail(err);

            var q = 'OCR';
            var msg = JSON.stringify(message);

            function on_channel_open(err, ch) {
                if (err) return bail(err, conn);

                ch.assertQueue(q, { durable: false }, function(err, ok) {
                    if (err) return bail(err, conn);

                    ch.sendToQueue(q, new Buffer(msg));
                    console.log(" [x] Sent '%s'", msg);
                    ch.close(function() {
                        conn.close();
                        callback();
                    });
                });
            }
            conn.createChannel(on_channel_open);
        }
        console.log('connecting');
        amqp.connect(on_connect);

        // Promise approach (below) vs Callback approach (above)

        // var when = require('when');

        //amqp.connect('amqp://localhost').then(function(conn) {
        //    return when(conn.createChannel().then(function(ch) {
        //        var q = 'OCR';
        //        var msg = JSON.parse(message);
        //
        //        var ok = ch.assertQueue(q, {durable: false});
        //
        //        return ok.then(function(_qok) {
        //            ch.sendToQueue(q, new Buffer(msg));
        //            console.log(" [x] Sent '%s'", msg);
        //            return ch.close();
        //        });
        //    })).ensure(function() { conn.close(); });;
        //}).then(null, console.warn);
    }
};