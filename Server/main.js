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
var functions = require('./classes/functions.js').create();
var server = require('./classes/server.js').createServer();

// 서버 세부 설정
var tcp_port   = 20000; //TCP port
var ip         = '127.0.0.1'; //IP address
var worker_max = 10;
var worker_id  = 1;
var room = new Array();
var room_max = 10;

// 시그널 설정
const signal_ping = 0;
const signal_login = 1;
const signal_search = 2;
const signal_move = 3;

// 서버의 모든 관리는 이 프로세서를 거쳐야합니다 !
if (cluster.isMaster) {
    // Requires
    var User = require('./classes/user.js');
    var UserBox = require('./classes/user_box.js');

    // 변수 설정
    var authenticated_users = UserBox.create();

    // 큐
    class Queue {
        constructor() {
            this._arr = [];
        }
        enqueue(item) {
            this._arr.push(item);
        }
        dequeue() {
            return this._arr.shift();
        }
        length() {
            return this._arr.length;
        }
        destroy(message) {
            this._arr.splice(this._arr.indexOf(message), 1);
        }
    }
    const match_wait = new Queue();
    

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
        console.log("- 워커 ".red + worker.process.pid + "가 죽었습니다 - 사망원인 | ".red + code);
        var new_worker = cluster.fork();
        new_worker.send({ to: 'worker', type: 'start', port: tcp_port, id: worker_id });
        worker_id++;
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
                            if (user.uuid == -1) {
                                user.uuid = message.uuid;
                                check = -1;
                                console.log("   " + message.id + " 유저 재접속".gray);
                                worker.send({ to: 'worker', type: 'login', msg: 2, uuid: message.uuid });
                            } else {
                                check = -1;
                                worker.send({ to: 'worker', type: 'login', msg: 0, uuid: message.uuid });
                            }
                        }
                    });

                    if (check == 1) {
                        // 새로 들어온 유저!
                        var new_user = User.create(message.uuid, -1, message.id);
                        authenticated_users.addUser(new_user);
                        console.log("   " + message.id + " 유저 신규 로드".gray);
                        worker.send({ to: 'worker', type: 'login', msg: 1, uuid: message.uuid });
                    }
                    break;

                case 'logout':
                    authenticated_users.each(function (user) {
                        if (user.uuid == message.uuid) {
                            match_wait.destroy(message.uuid);
                            user.uuid = -1;
                        }
                    });
                    break;

                case 'search':
                    if (message.id == 1) {
                        // 대기열 삽입
                        match_wait.enqueue(message.uuid);
                        console.log(match_wait._arr);
                    } else if (message.id == 2){
                        // 대기열에서 삭제
                        match_wait.destroy(message.uuid);
                        console.log(match_wait._arr);
                    }
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

    // 메세지 보내는 방법
    function send_id_message(sock, id, msg) {
        if (sock != -1) {
            var json_string = JSON.stringify({
                id: id,
                msg: msg
            });
            sock.send("㏆" + json_string.length + "®" + json_string);
        }
    }

    // 파이프 통신
    process.on('message', function (message) {
        if (message.to == 'worker') {
            switch (message.type) {

                case 'start':
                    server.listen(message.port, ip);
                    worker_id = message.id;
                    break;
                
                case 'login':
                    authenticated_users.each(function (user) {
                        if (user.uuid == message.uuid) {
                            var json_data = JSON.stringify({
                                msg: message.msg,
                                uuid: user.uuid
                            });
                            send_id_message(user.socket, signal_login, json_data);
                        }
                    });
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
                        var id = json_data.id;
                        var msg = json_data.msg;

                        // 클라이언트 세부 메세지 처리
                        switch (id) {
                            case signal_ping:
                                send_id_message(dsocket, signal_ping, msg);
                                break;

                            case signal_login:
                                if (authenticated_users.findUserBySocket(dsocket) == null) {
                                    var new_user = User_worker.create(0, dsocket);
                                    authenticated_users.addUser(new_user);
                                    process.send({ type: 'login', to: 'master', uuid: new_user.uuid, id: msg });
                                    console.log("   pid ".gray + process.pid + " 에서 ".gray + msg + "로 로그인 시도".gray);
                                } else {
                                    var temp = authenticated_users.findUserBySocket(dsocket);
                                    process.send({ type: 'login', to: 'master', uuid: temp.uuid, id: msg });
                                    console.log("   pid ".gray + process.pid + " 에서 ".gray + msg + "로 로그인 시도".gray);
                                }
                                break;

                            case signal_search:
                                process.send({ type: 'search', to: 'master', uuid: authenticated_users.findUserBySocket(dsocket).uuid, id: msg });
                                break;

                            case signal_move:

                                break;

                            default:
                                console.log(id);
                                break;
                        }

                        buffer_reading_string = "";
                    }

                }
            } catch (e) {
                temp_buffer = "";
                buffer_reading_string = "";
                console.log("- pid ".red + process.pid + "에서 에러 발생 | ".red + e);
            }
        });
        // 클라이언트와의 연결이 끊겼을때
        dsocket.onClose(function () {
            var quitter;
            if ((quitter = authenticated_users.findUserBySocket(dsocket)) != null) {
                console.log("- 유저 나감 (".gray + (quitter.uuid).gray + ")".gray);
                process.send({ type: 'logout', to: 'master', uuid: quitter.uuid });
                authenticated_users.removeUser(quitter.uuid);
            }
        });
    });
}