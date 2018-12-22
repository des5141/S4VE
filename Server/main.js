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

// 서버 세부 설정
var tcp_port = 20000; //TCP port
var ip = '127.0.0.1'; //IP address
var worker_max = 10;

// 변수 설정
var temp_buffer = "", buffer_string = "", buffer_reading_string = "", i = 0;
var authenticated_users = UserBox.create();

// 시그널 설정


// 서버의 모든 관리는 이 프로세서를 거쳐야합니다 !
if (cluster.isMaster) {
    var tasks = [
        function (callback) {
            worker_list = new Array();
            callback(null, "Master processor start");
        },
        function (callback) {
            console.log("- - - - - - - - - - - - - ".inverse);
            console.log("- 워커들을 생성합니다.".white);
            for (i = 0; i < worker_max; i++) {
                cluster.fork();
                worker_list[i] = 0;
            }
            callback(null, "Worker forked!");
        }
    ]; async.series(tasks, function (err, results) { });

    // 워커는 죽지 못해요. 신안 노예랍니다.
    cluster.on('exit', function (worker, code, signal) {
        console.log("- 워커 ".red + worker.id + " 가 죽었습니다".red);
        if (code == 200) {
            cluster.fork();
        }
    });

    // 일 시작이다 노예들아!
    for (var id in cluster.workers) {
        cluster.workers[id].send({ to: 'worker', type: 'start', port: tcp_port});
    }

    // 워커들과의 파이프 통신
    cluster.on('message', function (worker, message) {
        if (message.to == 'master') {
            switch (message.type) {
                case 'process_user_count':
                    worker_list[message.id] = message.value;
                    break;
            }
        }

        // 내가 받을 메세지가 아니니 에코
        if (message.to == 'worker') {
            for (var id in cluster.workers) {
                cluster.workers[id].send(message);
            }
        }
    });

    // 무한 반복 시킬 내용
    !function step() {

        setTimeout(function () {
            step();
        }, 10);
    }()
}

// 노동자 내용
if (cluster.isWorker) {
    // 파이프 통신
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
        dsocket.onMessage(function (data) {
            try {
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

                        // 클라이언트 세부 메세지 처리
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
                console.log("- pid ".error + process.pid + "에서 에러 발생 | " + e);
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