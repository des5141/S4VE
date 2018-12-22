/* 
 * 이 서버의 문제점
 * 1) 유저가 접속할때마다 데이터가 생성이 되는데, 이게 사라지지 않는다. 심각. 정기점검으로 매번 지워주는 수 밖에 없을 것 같다. << 마스터에만 쌓이는 걸 제외하면 해결. (이건 핸드오프 때문에 어쩔 수 없는 듯)
 * 2) 
 * 
 */

// Requires
var cluster = require('cluster');
var Colors = require('colors');
var split = require('string-split');
var fs = require('fs');
var async = require('async');
var functions = require('./classes/functions.js');
var server = require('./classes/server.js').createServer();

// 서버 세부 설정
var tcp_port   = 20000; //TCP port
var ip         = '127.0.0.1'; //IP address
var worker_max = 10;
var worker_id  = 1;

// 시그널 설정
const signal_ping = 0;
const signal_login = 1;

// 서버의 모든 관리는 이 프로세서를 거쳐야합니다 !
if (cluster.isMaster) {
    // Requires
    var User = require('./classes/user.js');
    var UserBox = require('./classes/user_box.js');

    // 변수 설정
    var authenticated_users = UserBox.create();

    // 워커 생성
    var tasks = [
        function (callback) {
            console.log("- - - - - - - - - - - - - ".inverse);
            console.log("- 워커들을 생성합니다.".white);
            for (i = 0; i < worker_max; i++) {
                cluster.fork();
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
        cluster.workers[id].send({ to: 'worker', type: 'start', port: tcp_port, id: worker_id });
        worker_id++;
    }

    // 워커들과의 파이프 통신
    cluster.on('message', function (worker, message) {
        if ((message.to == 'master') || (message.to == 'all')) {
            switch (message.type) {
                case 'login': 
                    var check = 1;
                    authenticated_users.each(function (user) {
                        // 기존에 데이터가 있는 유저!
                        if (user.id == message.id) {
                            user.uuid = message.uuid;
                            check = -1;
                        }
                    });

                    if (check == 1) {
                        // 새로 들어온 유저!
                        var new_user = User.create(message.uuid, -1, message.id);
                        authenticated_users.addUser(new_user);
                    }
                    
                    for (var id in cluster.workers) {
                        cluster.workers[id].send({ type: 'login', to: 'worker', uuid: message.uuid});
                    }
                    break;

                case 'logout':
                    authenticated_users.each(function (user) {
                        if (user.uuid == message.uuid) {
                            user.uuid = -1;
                        }
                    });
                    break;
            }
        }

        // 내가 받을 메세지가 아니니 에코
        if ((message.to == 'worker') || (message.to == 'all')) {
            for (var id in cluster.workers) {
                cluster.workers[id].send(message);
            }
        }
    });

    // 무한 반복 시킬 내용
    !function step() {
        authenticated_users.each(function (user) {

        });

        setTimeout(function () {
            step();
        }, 10);
    }()
}

// 노동자 내용
if (cluster.isWorker) {
    // Requires
    var User_worker = require('./classes/user_worker.js');
    var UserBox_worker = require('./classes/user_box_worker.js');

    // 변수 설정
    var temp_buffer = "", buffer_string = "", buffer_reading_string = "", i = 0;
    var authenticated_users = UserBox_worker.create();

    // 파이프 통신
    process.on('message', function (message) {
        if (message.to == 'worker') {
            switch (message.type) {

                case 'start':
                    server.listen(message.port, ip);
                    worker_id = message.id;
                    break;

                case 'login':
                    if (authenticated_users.findUserById(message.id) == null) {
                        var new_user = User.create(message.uuid, -1, 0);
                        authenticated_users.addUser(new_user);
                    }
                    break;

                case 'logout':
                    removeUser(message.uuid);
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
                            case signal_ping:

                                break;

                            case signal_login:
                                if (authenticated_users.findUserBySocket(dsocket) == null) {
                                    var new_user = User.create(0, dsocket, 1);
                                    authenticated_users.addUser(new_user);
                                    process.send({ type: 'login', to: 'master', uuid: new_user.uuid, id: msg });
                                }
                                break;

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
                console.log("- 유저 ".gray, quitter.name, "나감 (".gray + (quitter.uuid).gray + ")".gray);
                process.send({ type: 'logout', to: 'all', uuid: quitter.uuid });
                removeUser(quitter.uuid);
            }
        });
    });
}