// Requires
var cluster = require('cluster');
var User = require('./classes/user.js');
var UserBox = require('./classes/user_box.js');
var Colors = require('colors');
var split = require('string-split');
var fs = require('fs');
var async = require('async');
var functions = require('./classes/functions.js');
var server = require('./classes/server.js').createServer();

// Setup server information
var tcp_port = 20000; //TCP port
var ip = '127.0.0.1'; //IP address
var worker_max = 10;

// Set variables
var temp_buffer = "", buffer_string = "", buffer_reading_string = "", i = 0;
var authenticated_users = UserBox.create();

// Signal setting


//Main code is start from here !
if (cluster.isMaster) {
    var tasks = [
        function (callback) {
            // Master processor
            worker_list = new Array();
            callback(null, "Master processor start");
        },
        function (callback) {
            // Make worker as much as count of cpu
            console.log("Cluster fork - - - - - - - - - ".inverse);
            for (i = 0; i < worker_max; i++) {
                cluster.fork();
                worker_list[i] = 0;
            }
            callback(null, "Worker forked!");
        }
    ]; async.series(tasks, function (err, results) { });

    // If suddenly, worker died
    cluster.on('exit', function (worker, code, signal) {

        // Died worker
        console.log('Worker died - '.error + "processer".gray + worker.id);
        if (code == 200) {
            cluster.fork();
        }
    });

    // Workers server on!
    for (var id in cluster.workers) {
        cluster.workers[id].send({ to: 'worker', type: 'start', port: tcp_port});
    }
    
    // Step event
    !function step() {

        setTimeout(function () {
            step();
        }, 10);
    }()

    // Processor Message
    cluster.on('message', function (worker, message) {
        if (message.to == 'master') {
            switch (message.type) {
                case 'process_user_count':
                    worker_list[message.id] = message.value;
                    break;
            }
        }

        if (message.to == 'worker') {
            //Message to worker
            for (var id in cluster.workers) {
                cluster.workers[id].send(message);
            }
        }
    });
}

//Worker processor
if (cluster.isWorker) {
    // Processor Message
    process.on('message', function (message) {
        if (message.to == 'worker') {
            switch (message.type) {

                case 'start':
                    server.listen(message.port, ip);
                    break;

                default:
                    break;
            }
        }
    });

    server.onConnection(function (dsocket) {
        // When get the messages
        dsocket.onMessage(function (data) {
            try {
                // Set the operation
                buffer_string = data.toString();
                buffer_reading_string = temp_buffer + buffer_reading_string;
                temp_buffer = "";

                for (i = 0; i < buffer_string.length; i++) {
                    if (buffer_string.charAt(i) != "#") {
                        buffer_reading_string += buffer_string.charAt(i);
                        if (buffer_string.length - 1 == i) {
                            temp_buffer += buffer_reading_string;
                        }
                    }

                    if (buffer_string.charAt(i) == "#") {
                        var json_data = JSON.parse(buffer_reading_string);
                        buffer_reading_string = "";
                        var id = json_data.id;
                        var msg = json_data.msg;

                        //Route into different functions
                        switch (id) {
                            default:
                                console.log(id);
                                break;
                        }
                    }

                }
            } catch (e) {
                temp_buffer = "";
                buffer_reading_string = "";
                console.log("Error processing message :".error, e);
            }
        });
        // When client disconnect
        dsocket.onClose(function () {
            //Respond for authenticated users only
            var quitter;
            if ((quitter = authenticated_users.findUserBySocket(dsocket)) != null) {
                console.log("Out user   :".data, quitter.name, "(" + quitter.uuid + ")");
                //Let everyone else know the user is leaving
                var logout_announcement = JSON.stringify({
                    name: quitter.name,
                    uuid: quitter.uuid
                });
                authenticated_users.each(function (user) {
                    if (user.uuid != quitter.uuid) {
                        send_id_message(user.socket, outsig_user_leave, logout_announcement);
                    }
                });
                quitter.socket = -1;
            }
        });
    });
}