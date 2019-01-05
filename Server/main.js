// #region Requires
var cluster = require('cluster');
var Colors = require('colors');
var split = require('string-split');
var fs = require('fs');
var async = require('async');
var functions = require('./classes/functions.js').create();
var server = require('./classes/server.js').createServer();
var uuid_v4 = require('uuid-v4');
var os = require('os');
var database = require('./classes/database');
const Player = require('./classes/game').Player;
const Game = require('./classes/game').Game;
const Team = require('./classes/game').Team;
// #endregion

// #region 서버 세부 설정
var debug_mode = 1; // 1 is on, 0 is off
var tcp_port = 20000; //TCP port
if (debug_mode == 1)
    var ip = '127.0.0.1'; //IP address
else
    var ip = '172.16.113.102';
var worker_id = 1;
var room = new Array();
var blue_gage = new Array();
var red_gage = new Array();
var room_max = 1;
var game_max = 2;
for (var i = 0; i < room_max; i++) {
    room[i] = "";
    blue_gage[i] = 0;
    red_gage[i] = 0;
}
var Games = new Array(room_max);
cluster.schedulingPolicy = cluster.SCHED_RR; //워커 스케쥴을 Round Robin 방식으로 한다.
// #endregion

// #region 시그널 설정
const signal_ping = 0;
const signal_login = 1;
const signal_search = 2;
const signal_move = 3;
const signal_handoff = 4;
const signal_instance = 5;
const signal_myinfo = 6;
const signal_hp = 7;
const signal_restart = 8;
const signal_register = 9;
const signal_endgame = 10;
const signal_kill_log = 11;
// #endregion

// #region Functions
function handoff(worker, uuid, x, y, type, team) {
    worker.send({
        to: 'worker', type: 'handoff',
        uuid: uuid,
        x: x,
        y: y,
        _type: type,
        team: team
    });
}
function find_room(target_room, f) {
    for (i = 0; i < room_max; i++) {
        if (room[i] == target_room) {
            f();
        }
    }
}
function send_raw(sock, write) {
    if (sock != -1) {
        buffer_write(write, buffer_string, "§");
        buffer_write(write, buffer_u16, write.offset);
        sock.send(write.buffer);
    }
}
// #region Buffer Setting
const buffer_u8 = 0;
const buffer_s8 = 1;
const buffer_u16 = 2;
const buffer_s16 = 3;
const buffer_u32 = 4;
const buffer_s32 = 5;
const buffer_string = 6;
// #endregion
// #region Buffer Function
function buffer_read(buffer, type, read) {
    switch (type) {
        case buffer_u8:
            read.offset++;
            return buffer.readUInt8(read.offset - 1);

        case buffer_s8:
            read.offset++;
            return buffer.readInt8(read.offset - 1);

        case buffer_u16:
            read.offset += 2;
            return buffer.readUInt16LE(read.offset - 2);

        case buffer_s16:
            read.offset += 2;
            return buffer.readInt16LE(read.offset - 2);

        case buffer_u32:
            read.offset += 4;
            return buffer.readUInt32LE(read.offset - 4);

        case buffer_s32:
            read.offset += 4;
            return buffer.readInt132LE(read.offset - 4);

        case buffer_string:
            var length = buffer_read(buffer, buffer_u16, read);
            read.offset += length + 1;
            return buffer.toString('utf-8', read.offset - length - 1, read.offset - 1);
    }
}
function buffer_write(write, type, value) {
    switch (type) {
        case buffer_u8:
            if (write.offset + 1 > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + 1).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset++;
            (write.buffer).writeUInt8(value, write.offset - 1);
            break;

        case buffer_s8:
            if (write.offset + 1 > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + 1).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset++;
            (write.buffer).writeInt8(value, write.offset - 1);
            break;

        case buffer_u16:
            if (write.offset + 2 > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + 2).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset += 2;
            (write.buffer).writeUInt16LE(value, write.offset - 2);
            break;

        case buffer_s16:
            if (write.offset + 2 > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + 2).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset += 2;
            (write.buffer).writeInt16LE(value, write.offset - 2);
            break;

        case buffer_u32:
            if (write.offset + 4 > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + 4).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset += 4;
            (write.buffer).writeUInt32LE(value, write.offset - 4);
            break;

        case buffer_s32:
            if (write.offset + 4 > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + 4).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset += 4;
            (write.buffer).writeInt32LE(value, write.offset - 4);
            break;

        case buffer_string:
            value = value + '\0';
            var length = Buffer.byteLength(value); // 개행문자를 추가한 길이
            //buffer_write(write, buffer_u16, length);
            if (write.offset + length > (write.buffer).length) {
                var temp = Buffer.allocUnsafe((write.buffer).length).fill(0);
                (write.buffer).copy(temp, 0, 0, (write.buffer).length);
                (write.buffer) = Buffer.allocUnsafe((write.buffer).length + length).fill(0);
                temp.copy((write.buffer), 0, 0, temp.length);
            }
            write.offset += length;
            (write.buffer).write(value, write.offset - length, write.offset);
            break;
    }
}
// #endregion
// #endregion

// 마스터 프로세서
if (cluster.isMaster) {
    // Requires
    var User = require('./classes/user.js');
    var UserBox = require('./classes/user_box.js');

    // 유저 설정
    var authenticated_users = UserBox.create();
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
            if (this._arr.indexOf(message) != -1) {
                this._arr.splice(this._arr.indexOf(message), 1);
            }
        }
    }
    const match_wait = new Queue();

    // 워커 생성
    var tasks = [
        function (callback) {
            console.log("- - - - - - - - - - - - - ".inverse);
            console.log("- 워커들을 생성합니다.".white);
            os.cpus().forEach(function (cpu) {
                cluster.fork(); // 스레드만큼 생성
            });
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
    cluster.on('message', async function (worker, message) {
        try {
            // 워커들에게 처리 후 전달
            if ((message.to == 'master') || (message.to == 'all')) {
                switch (message.type) {
                    case 'register':
                        // #region 내용
                        var check = 1;
                        authenticated_users.each(function (user) {
                            if (user.id == message.id) {
                                check = -1;
                            }
                        });

                        if (check == 1) {
                            await database.register(message.id, message.pass, message.nickname)
                                .then(result => {
                                    if (result) {
                                        worker.send({ to: 'worker', type: 'register', msg: 1, uuid: message.uuid });
                                    }
                                    else {
                                        worker.send({ to: 'worker', type: 'register', msg: 0, uuid: message.uuid });
                                    }
                                });
                        }
                        // #endregion
                        break;

                    case 'login':
                        // #region 내용
                        var check = 1;
                        authenticated_users.each(async function (user) {
                            // 기존에 데이터가 있는 유저!
                            if (user.id == message.id) {
                                check = -1;
                                if (user.uuid == -1) {
                                    // 받은 id에 매칭되는 pass인지 확인합니다.
                                    await database.login(message.id, message.pass)
                                        .then(result => {
                                            if (result.exist) {
                                                worker.send({ to: 'worker', type: 'login', msg: 2, uuid: message.uuid, nickname: result.name });
                                                user.uuid = message.uuid;
                                                user.nickname = result.name;
                                                var check_ = true;
                                                find_room(user.room, () => {
                                                    check_ = false;
                                                    console.log("   " + user.id + " 가 ".gray + user.room + " 으로 핸드오프".gray);
                                                    handoff(worker, message.uuid, user.x, user.y, user._type, user.team);
                                                });
                                                if (check_) {
                                                    user.room = "null";
                                                    user.room_i = -1;
                                                }
                                            }
                                            else {
                                                worker.send({ to: 'worker', type: 'login', msg: 0, uuid: message.uuid });
                                            }
                                        });
                                } else {
                                    worker.send({ to: 'worker', type: 'login', msg: 0, uuid: message.uuid });
                                }
                            }
                        });

                        if (check == 1) {
                            // 새로 들어온 유저!
                            await database.login(message.id, message.pass)
                                .then(result => {
                                    if (result.exist) {
                                        worker.send({ to: 'worker', type: 'login', msg: 1, uuid: message.uuid, nickname: result.name });
                                        var new_user = User.create(message.uuid, message.id);
                                        authenticated_users.addUser(new_user);
                                        new_user.nickname = result.name;
                                    } else {
                                        worker.send({ to: 'worker', type: 'login', msg: 0, uuid: message.uuid });
                                    }
                                });
                        }
                        // #endregion
                        break;

                    case 'logout':
                        // #region 내용
                        authenticated_users.each(function (user) {
                            if ((user.uuid == message.uuid) && (user.uuid != -1)) {
                                match_wait.destroy(user.uuid);
                                user.uuid = -1;
                            }
                        });
                        // #endregion
                        break;

                    case 'search':
                        // #region 내용
                        if (message.id == 1) {
                            // 대기열 삽입
                            match_wait.enqueue(message.uuid);
                            console.log(match_wait._arr);
                        } else if (message.id == 2) {
                            // 대기열에서 삭제
                            match_wait.destroy(message.uuid);
                            console.log(match_wait._arr);
                        }
                        // #endregion
                        break;

                    case 'move':
                        // #region 내용
                        var _id;
                        authenticated_users.each(function (user) {
                            if (user.uuid == message.uuid) {
                                _id = user.id;
                            }
                        });
                        var ins = authenticated_users.findUser(_id);
                        if (ins != undefined) {

                            ins.x = message.x;
                            ins.y = message.y;
                            ins.z = message.z;
                            ins._type = message._type;
                            ins.weapon_angle = message.weapon_angle;
                            ins.weapon_delay_i = message.weapon_delay_i;
                            ins.weapon_dir = message.weapon_dir;
                            ins.weapon_range = message.weapon_range;
                            ins.weapon_xdir = message.weapon_xdir;
                            ins.xdir = message.xdir;
                            ins.move = message.move;
                            ins.jump = message.jump;

                        } else {
                            console.log(authenticated_users.findUser(message.id));
                            console.log(message.id);
                        }
                        // #endregion
                        break;

                    case 'instance':
                        // #region 내용
                        var _id;
                        authenticated_users.each(function (user) {
                            if (user.uuid == message.uuid) {
                                _id = user.id;
                            }
                        });
                        var ins = authenticated_users.findUser(_id);
                        authenticated_users.each(function (user) {
                            if ((ins.room == user.room) && (ins.id != user.id)) {
                                switch (message.index) {
                                    case 0:
                                        for (var id in cluster.workers) {
                                            cluster.workers[id].send({
                                                type: 'instance',
                                                to: 'worker',
                                                index: message.index,
                                                x: message.x,
                                                y: message.y,
                                                weapon_dir: message.weapon_dir,
                                                uuid: user.uuid
                                            });
                                        }
                                        break;

                                    case 1:
                                        for (var id in cluster.workers) {
                                            cluster.workers[id].send({
                                                type: 'instance',
                                                to: 'worker',
                                                index: message.index,
                                                x: message.x,
                                                y: message.y,
                                                speed: message.speed,
                                                weapon_dir: message.weapon_dir,
                                                direction: message.direction,
                                                image_speed: message.image_speed,
                                                sprite_index: message.sprite_index,
                                                move: message.move,
                                                effector: message.effector,
                                                range: message.range,
                                                from: message.from,
                                                team: message.team,
                                                damage: message.damage,
                                                uuid: user.uuid
                                            });
                                        }
                                        break;

                                    case 3:
                                        for (var id in cluster.workers) {
                                            cluster.workers[id].send({
                                                type: 'instance',
                                                to: 'worker',
                                                index: message.index,
                                                x: message.x,
                                                y: message.y,
                                                speed: message.speed,
                                                weapon_dir: message.weapon_dir,
                                                direction: message.direction,
                                                image_speed: message.image_speed,
                                                sprite_index: message.sprite_index,
                                                move: message.move,
                                                effector: message.effector,
                                                range: message.range,
                                                from: message.from,
                                                team: message.team,
                                                damage: message.damage,
                                                uuid: user.uuid
                                            });
                                        }
                                        break;

                                    case 4:
                                        for (var id in cluster.workers) {
                                            cluster.workers[id].send({
                                                type: 'instance',
                                                to: 'worker',
                                                index: message.index,
                                                x: message.x,
                                                y: message.y,
                                                from: message.from,
                                                team: message.team,
                                                damage: message.damage,
                                                uuid: user.uuid
                                            });
                                        }
                                        break;

                                    default:
                                        break;
                                }
                            }
                        });
                        // #endregion
                        break;

                    case 'killLog':
                        // #region 내용
                        var _id;
                        authenticated_users.each(function (user) {
                            if (user.uuid == message.uuid) {
                                _id = user.id;
                            }
                        });
                        var ins = authenticated_users.findUser(_id);
                        authenticated_users.each(function (user) {
                            if (ins.room == user.room) {
                                for (var id in cluster.workers) {
                                    cluster.workers[id].send({ type: 'killLog', to: 'worker', a: message.a, b: message.b, uuid: user.uuid });
                                }
                            }
                        });
                        // #endregion
                        break;

                    case 'hp':
                        // #region 내용
                        var ins = authenticated_users.findUser(message.id);
                        ins.hp -= message.msg;
                        if (ins.hp > 100)
                            ins.hp = 100;
                        // #endregion
                        break;
                }
            }

            // 내가 받을 메세지가 아니니 에코
            if ((message.to == 'worker') || (message.to == 'all')) {
                for (var id in cluster.workers) {
                    cluster.workers[id].send(message);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    // 큐 내용을 확인하고 1초에 한번씩 매칭, 아무도 없는 방이면 삭제
    !function input_match() {
        var i, temp_data, temp_room, check = -1, j;
        for (i = 0; i < room_max; i++) {
            var check = 1;
            authenticated_users.each(function (user) {
                if ((user.room == room[i]) && (user.uuid != -1)) {
                    check = -1;
                }
            });

            if (check == 1) {
                room[i] = "";
            }
        }

        if (match_wait.length() >= game_max) {
            for (i = 0; i < room_max; i++) {
                if (room[i] == "") {
                    temp_room = uuid_v4();
                    room[i] = temp_room;
                    red_gage[i] = 0;
                    blue_gage[i] = 0;
                    console.log(room[i]);
                    var team = "red";
                    var TeamRed = new Team(game_max / 2, "red");
                    var TeamBlue = new Team(game_max / 2, "blue");
                    for (j = 0; j < game_max; j++) {
                        temp_data = match_wait.dequeue();
                        authenticated_users.each(function (user) {
                            if (user.uuid == temp_data) {
                                user.hp = 100;
                                user.sp = 100;
                                user._type = -1;
                                var player = new Player(user.id, "test", user._type);

                                if (team == "red") {
                                    TeamBlue.AddPlayer(player);
                                    team = "blue";
                                    user.x = 762 + functions.getRandomInt(10, 30);
                                    user.y = 1408 + functions.getRandomInt(10, 30);
                                    user.respawn = -1;
                                    user.hp = 100;
                                }
                                else {
                                    TeamRed.AddPlayer(player);
                                    team = "red";
                                    user.x = 96 + functions.getRandomInt(10, 30);
                                    user.y = 1408 + functions.getRandomInt(10, 30);
                                    user.respawn = -1;
                                    user.hp = 100;
                                }

                                console.log(user.uuid);
                                user.room = temp_room;
                                user.team = team;
                                user.room_i = i;
                                console.log("- " + user.room);
                                for (var id in cluster.workers) {
                                    cluster.workers[id].send({ type: 'search', to: 'worker', uuid: user.uuid, id: 1, team: user.team, x: user.x, y: user.y });
                                }
                            }
                        });
                    }
                    var game = new Game(TeamRed, TeamBlue);
                    Games[i] = game;
                    break;
                }
            }
        }

        setTimeout(function () {
            input_match();
        }, 1000);
    }()

    // 내 정보
    !function my_info() {
        for (var i = 0; i < room_max; i++) {
            authenticated_users.each(function (user) {
                for (i = 0; i < room_max; i++) {
                    if (user.room == room[i]) {
                        if (user.uuid != -1) {
                            for (var id in cluster.workers) {
                                cluster.workers[id].send({
                                    type: 'myinfo', to: 'worker',
                                    uuid: user.uuid,
                                    hp: user.hp,
                                    sp: user.sp,
                                    respawn: user.respawn,
                                    red_gage: red_gage[user.room_i],
                                    blue_gage: blue_gage[user.room_i],
                                    engagement: user.engagement
                                });
                            }
                        }
                    }
                }
            });
        }
        setTimeout(function () {
            my_info();
        }, 60);
    }()

    // 무한 반복 시킬 내용
    !function step() {
        var i;
        // 게임 진행
        for (i = 0; i < room_max; i++) {
            //게이지 올리기
            var red_check = -1;
            var blue_check = -1;
            authenticated_users.each(function (user) {
                if ((user.room == room[i]) && (user.x > 330) && (user.x < 630) && (user.y > 210) && (user.y < 510)) {
                    if (user.team == "red") {
                        red_check = 1;
                    } else if (user.team == "blue") {
                        blue_check = 1;
                    }
                }
            });
            if (!((red_check == 1) && (blue_check == 1))) {
                if (red_check == 1) {
                    red_gage[i]++;
                }
                if (blue_check == 1) {
                    blue_gage[i]++;
                }
                authenticated_users.each(function (user) {
                    if (user.room == room[i]) {
                        user.engagement = -1;
                    }
                });
            } else {
                authenticated_users.each(function (user) {
                    if (user.room == room[i]) {
                        user.engagement = 1;
                    }
                });
            }
            //게이지 확인
            if (red_gage[i] != blue_gage[i] && room[i] != "") {
                // 게이지 찬 값이 같으면 동점이니 계속 연장
                if (red_gage[i] > 1800) {
                    // user.team 이 "red" 이거나, "blue" 임
                    Games[i].RedTeam.EndGame(true);
                    Games[i].BlueTeam.EndGame(false);
                    // 빨강 승리
                    authenticated_users.each(function (user) {
                        if (user.room == room[i]) {
                            user.room = "null";
                            user.room_i = -1;
                            for (var id in cluster.workers) {
                                cluster.workers[id].send({ type: 'endgame', to: 'worker', uuid: user.uuid, team: "red" });
                            }
                        }
                    });
                    room[i] = "";
                    red_gage[i] = 0;
                    blue_gage[i] = 0;
                }

                if (blue_gage[i] > 1800) {
                    Games[i].RedTeam.EndGame(false);
                    Games[i].BlueTeam.EndGame(true);
                    // 파랑 승리
                    authenticated_users.each(function (user) {
                        if (user.room == room[i]) {
                            user.room = "null";
                            user.room_i = -1;
                        }

                        for (var id in cluster.workers) {
                            cluster.workers[id].send({ type: 'endgame', to: 'worker', uuid: user.uuid, team: "blue" });
                        }
                    });

                    room[i] = "";
                    red_gage[i] = 0;
                    blue_gage[i] = 0;
                }
            }
        }
        authenticated_users.each(function (user) {
            for (i = 0; i < room_max; i++) {
                if (user.room == room[i]) {
                    if (user.hp <= 0) {
                        user.respawn = 60 * 20;
                        user.hp = 100;
                        if (user.team == "blue") {
                            user.x = 762 + functions.getRandomInt(10, 30);
                            user.y = 1408 + functions.getRandomInt(10, 30);
                        } else {
                            user.x = 96 + functions.getRandomInt(10, 30);
                            user.y = 1408 + functions.getRandomInt(10, 30);
                        }
                        if (user.uuid != -1) {
                            for (var id in cluster.workers) {
                                cluster.workers[id].send({ type: 'restart', to: 'worker', uuid: user.uuid, x: user.x, y: user.y });
                            }
                        }
                    }
                }
            }
            if (user.room != "null") {
                authenticated_users.each(function (to_user) {
                    if ((to_user.room == user.room) && (user.id != to_user.id) && (to_user.uuid != -1)) {
                        if ((user._type != -1)/*  && (Math.sqrt(Math.pow((user.x - to_user.x), 2) + Math.pow((user.y - to_user.y), 2)) < 250) 데이터 주고받기 최소화 */) {
                            for (var id in cluster.workers) {
                                cluster.workers[id].send({
                                    type: 'move', to: 'worker',
                                    id: user.id,
                                    user_id: to_user.uuid,
                                    x: user.x,
                                    y: user.y,
                                    z: user.z,
                                    _type: user._type,
                                    weapon_delay_i: user.weapon_delay_i,
                                    weapon_range: user.weapon_range,
                                    weapon_angle: user.weapon_angle,
                                    move: user.move,
                                    jump: user.jump,
                                    weapon_dir: user.weapon_dir,
                                    weapon_xdir: user.weapon_xdir,
                                    xdir: user.xdir,
                                    hp: user.hp,
                                    sp: user.sp,
                                    team: user.team,
                                    nickname: user.nickname,
                                    respawn: user.respawn
                                });
                            }
                        }

                    }
                });
            }
            if (user.respawn > -1) {
                user.respawn--;
            }
        });
        setTimeout(function () {
            step();
        }, 30);
    }()
}

// 워커 프로세서
if (cluster.isWorker) {
    // Requires
    var User_worker = require('./classes/user_worker.js');
    var UserBox_worker = require('./classes/user_box_worker.js');

    // Variables init
    authenticated_users = UserBox_worker.create();
    var buffer_temp = -1;
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
            if (this._arr.indexOf(message) != -1) {
                this._arr.splice(this._arr.indexOf(message), 1);
            }
        }
    }
    var message_processing = new Queue();
    var message_socket = new Queue();

    // 클라이언트 통신
    server.onConnection(function (dsocket) {
        // #region 클라이언트 메세지 분석 후 큐에 삽입
        dsocket.onMessage(function (data) {
            try {
                // 데이터를 잇는다
                if (buffer_temp == -1) {
                    buffer_temp = Buffer.allocUnsafe(data.length).fill(0);
                    data.copy(buffer_temp, 0, 0, data.length);
                } else {
                    buffer_temp = Buffer.concat([buffer_temp, data], data.length + buffer_temp.length);
                }
                var index = 0;
                while (true) {
                    if (buffer_temp.toString('utf-8', index - 4, index - 2) == "§") {
                        var length = buffer_temp.readUInt16LE(index - 2) - 2;
                        message_processing.enqueue(buffer_temp.slice(index - 4 - length, index - 4));
                        message_socket.enqueue(dsocket);
                        buffer_temp = buffer_temp.slice(index, buffer_temp.length);
                        index = 0;
                        continue;
                    }
                    if (index >= buffer_temp.length) {
                        break;
                    }
                    index++;
                }
            } catch (e) {
                console.log("- pid ".red + process.pid + "에서 에러 발생 | ".red + e);
            }
        });
        // #endregion
        // #region 클라이언트와의 연결이 끊겼을때
        dsocket.onClose(function () {
            var quitter;
            if ((quitter = authenticated_users.findUserBySocket(dsocket)) != null) {
                console.log("- 유저 나감 (".gray + (quitter.uuid).gray + ")".gray);
                process.send({ type: 'logout', to: 'master', uuid: quitter.uuid });
                authenticated_users.removeUserData(quitter.uuid);
            }
        });
        // #endregion
    });

    // 파이프 통신
    process.on('message', function (message) {
        if (message.to == 'worker') {
            switch (message.type) {
                case 'start':
                    // #region 내용
                    server.listen(message.port, ip);
                    worker_id = message.id;
                    // #endregion
                    break;

                case 'login':
                    // #region 내용
                    var temp_nickname = "null";
                    if (message.nickname != undefined)
                        temp_nickname = message.nickname;
                    authenticated_users.each(function (user) {
                        if (user.uuid == message.uuid) {
                            var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                            buffer_write(write, buffer_u8, signal_login);
                            buffer_write(write, buffer_u8, message.msg);
                            if ((message.msg == 1) || (message.msg == 2)) {
                                buffer_write(write, buffer_string, message.uuid);
                                buffer_write(write, buffer_string, message.nickname);
                            }
                            send_raw(user.socket, write);
                        }
                    });
                    // #endregion
                    break;

                case 'register':
                    // #region 내용
                    authenticated_users.each(function (user) {
                        if (user.uuid == message.uuid) {
                            var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                            buffer_write(write, buffer_u8, signal_register);
                            buffer_write(write, buffer_u8, message.msg);
                            send_raw(user.socket, write);
                        }
                    });
                    // #endregion
                    break;

                case 'endgame':
                    // #region 내용
                    authenticated_users.each(function (user) {
                        if (user.uuid == message.uuid) {
                            send_id_message(user.socket, signal_endgame, message.team);
                        }
                    });
                    // #endregion
                    break;

                case 'search':
                    // #region 내용
                    if (message.id == 1) {
                        authenticated_users.each(function (user) {
                            if (user.uuid == message.uuid) {
                                var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                                buffer_write(write, buffer_u8, signal_search);
                                buffer_write(write, buffer_string, message.team);
                                buffer_write(write, buffer_u16, message.x);
                                buffer_write(write, buffer_u16, message.y);
                                send_raw(user.socket, write);
                            }
                        });
                    }
                    // #endregion
                    break;

                case 'move':
                    // #region 내용
                    var ins = authenticated_users.findUser(message.user_id);
                    if (ins != undefined) {
                        var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                        buffer_write(write, buffer_u8, signal_move);
                        buffer_write(write, buffer_string, message.id);
                        buffer_write(write, buffer_u8, message._type);
                        buffer_write(write, buffer_u16, message.x);
                        buffer_write(write, buffer_u16, message.y);
                        buffer_write(write, buffer_u16, message.z);
                        buffer_write(write, buffer_s16, message.weapon_delay_i);
                        buffer_write(write, buffer_s16, message.weapon_range);
                        buffer_write(write, buffer_s16, message.weapon_angle);
                        buffer_write(write, buffer_s16, message.weapon_dir);
                        buffer_write(write, buffer_s16, message.weapon_xdir);
                        buffer_write(write, buffer_s8, message.move);
                        buffer_write(write, buffer_s8, message.jump);
                        buffer_write(write, buffer_s8, message.xdir);
                        buffer_write(write, buffer_s16, message.hp);
                        buffer_write(write, buffer_s16, message.sp);
                        buffer_write(write, buffer_string, message.team);
                        buffer_write(write, buffer_string, message.nickname);
                        buffer_write(write, buffer_s16, message.respawn);
                        send_raw(ins.socket, write);
                    }
                    // #endregion
                    break;

                case 'handoff':
                    // #region 내용
                    var ins = authenticated_users.findUser(message.uuid);
                    if (ins != undefined) {
                        var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                        buffer_write(write, buffer_u8, signal_handoff);
                        buffer_write(write, buffer_u8, message._type);
                        buffer_write(write, buffer_u16, message.x);
                        buffer_write(write, buffer_u16, message.y);
                        buffer_write(write, buffer_string, message.team);
                        send_raw(ins.socket, write);
                    }
                    // #endregion
                    break;

                case 'instance':
                    // #region 내용
                    var ins = authenticated_users.findUser(message.uuid);
                    if (ins != undefined) {
                        var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                        buffer_write(write, buffer_u8, signal_instance);
                        buffer_write(write, buffer_u8, message.index);
                        switch (message.index) {
                            case 0:
                                // #region 내용
                                buffer_write(write, buffer_u16, message.x);
                                buffer_write(write, buffer_u16, message.y);
                                buffer_write(write, buffer_s16, message.weapon_dir);
                                // #endregion
                                break;

                            case 1:
                                // #region 내용
                                buffer_write(write, buffer_u16, message.x);
                                buffer_write(write, buffer_u16, message.y);
                                buffer_write(write, buffer_u8, message.speed);
                                buffer_write(write, buffer_s16, message.weapon_dir);
                                buffer_write(write, buffer_s16, message.direction);
                                buffer_write(write, buffer_s16, message.image_speed);
                                buffer_write(write, buffer_s16, message.sprite_index);
                                buffer_write(write, buffer_s8, message.move);
                                buffer_write(write, buffer_s16, message.effector);
                                buffer_write(write, buffer_s16, message.range);
                                buffer_write(write, buffer_string, message.from);
                                buffer_write(write, buffer_string, message.team);
                                buffer_write(write, buffer_s16, message.damage);
                                // #endregion
                                break;

                            // case 2는 순간이동 기술

                            case 3:
                                // #region 내용
                                buffer_write(write, buffer_u16, message.x);
                                buffer_write(write, buffer_u16, message.y);
                                buffer_write(write, buffer_u8, message.speed);
                                buffer_write(write, buffer_s16, message.weapon_dir);
                                buffer_write(write, buffer_s16, message.direction);
                                buffer_write(write, buffer_s16, message.image_speed);
                                buffer_write(write, buffer_s16, message.sprite_index);
                                buffer_write(write, buffer_s8, message.move);
                                buffer_write(write, buffer_s16, message.effector);
                                buffer_write(write, buffer_s16, message.range);
                                buffer_write(write, buffer_string, message.from);
                                buffer_write(write, buffer_string, message.team);
                                buffer_write(write, buffer_s16, message.damage);
                                // #endregion
                                break;
                            
                            case 4:
                                // #region 내용
                                buffer_write(write, buffer_u16, message.x);
                                buffer_write(write, buffer_u16, message.y);
                                buffer_write(write, buffer_string, message.from);
                                buffer_write(write, buffer_string, message.team);
                                buffer_write(write, buffer_s16, message.damage);
                                // #endregion
                                break;
                        }
                        send_raw(ins.socket, write);
                    }
                    // #endregion
                    break;

                case 'killLog':
                    // #region 내용
                    var ins = authenticated_users.findUser(message.uuid);
                    if (ins != undefined) {
                        var json_data = JSON.stringify({
                            a: message.a,
                            b: message.b
                        });
                        send_id_message(ins.socket, signal_kill_log, json_data);
                    }
                    // #endregion
                    break;

                case 'myinfo':
                    // #region 내용
                    var ins = authenticated_users.findUser(message.uuid);
                    if (ins != undefined) {
                        var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                        buffer_write(write, buffer_u8, signal_myinfo);
                        buffer_write(write, buffer_s16, message.hp);
                        buffer_write(write, buffer_s16, message.sp);
                        buffer_write(write, buffer_u32, message.red_gage);
                        buffer_write(write, buffer_u32, message.blue_gage);
                        buffer_write(write, buffer_s16, message.respawn);
                        buffer_write(write, buffer_s8, message.engagement);
                        send_raw(ins.socket, write);
                    }
                    // #endregion
                    break;

                case 'restart':
                    // #region 내용
                    var ins = authenticated_users.findUser(message.uuid);
                    if (ins != undefined) {
                        var json_data = JSON.stringify({
                            x: message.x,
                            y: message.y
                        });
                        send_id_message(ins.socket, signal_restart, json_data);
                    }
                    // #endregion
                    break;

                default:
                    break;
            }
        }
    });


    // 메세지 처리
    !function processing() {
        while (message_processing.length() != 0) {
            try {
                var dsocket = message_socket.dequeue();
                var data = message_processing.dequeue();
                var signal = -1;
                var read = { offset: 0 };
                var ins = authenticated_users.findUserBySocket(dsocket);
                signal = buffer_read(data, buffer_u8, read);

                if (ins == null) {
                    // #region 아직 로그인 안한 유저
                    switch (signal) {
                        case signal_ping:
                            // #region 내용
                            var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                            buffer_write(write, buffer_u8, signal_ping);
                            send_raw(dsocket, write);
                            // #endregion
                            break;

                        case signal_login:
                            // #region 내용
                            var get_id = buffer_read(data, buffer_string, read);
                            var get_pass = buffer_read(data, buffer_string, read);
                            console.log(get_id + " | " + get_pass);
                            var new_user = User_worker.create(0, dsocket);
                            authenticated_users.addUser(new_user);
                            process.send({
                                type: 'login',
                                to: 'master',
                                uuid: new_user.uuid,
                                id: get_id,
                                pass: get_pass
                            });
                            console.log("   pid ".gray + process.pid + " 에서 ".gray + get_id + "로 로그인 시도".gray);
                            // #endregion
                            break;

                        case signal_register:
                            // #region 내용
                            var get_id = buffer_read(data, buffer_string, read);
                            var get_pass = buffer_read(data, buffer_string, read);
                            var get_nickname = buffer_read(data, buffer_string, read);
                            console.log(get_id + " | " + get_pass + " | " + get_nickname);
                            var new_user = User_worker.create(0, dsocket);
                            authenticated_users.addUser(new_user);
                            process.send({
                                type: 'register',
                                to: 'master',
                                uuid: new_user.uuid,
                                id: get_id,
                                pass: get_pass,
                                nickname: get_nickname
                            });
                            // #endregion
                            break;
                    }
                    // #endregion
                } else {
                    // #region 로그인 한 유저
                    switch (signal) {
                        case signal_ping:
                            // #region 내용
                            var write = { buffer: Buffer.allocUnsafe(1).fill(0), offset: 0 };
                            buffer_write(write, buffer_u8, signal_ping);
                            send_raw(dsocket, write);
                            // #endregion
                            break;

                        case signal_login:
                            // #region 내용
                            var get_id = buffer_read(data, buffer_string, read);
                            var get_pass = buffer_read(data, buffer_string, read);
                            console.log(get_id + " | " + get_pass);

                            process.send({
                                type: 'login',
                                to: 'master',
                                uuid: authenticated_users.findUserBySocket(dsocket).uuid,
                                id: get_id,
                                pass: get_pass
                            });
                            console.log("   pid ".gray + process.pid + " 에서 ".gray + get_id + "로 로그인 시도".gray);
                            // #endregion
                            break;

                        case signal_register:
                            // #region 내용
                            var get_id = buffer_read(data, buffer_string, read);
                            var get_pass = buffer_read(data, buffer_string, read);
                            var get_nickname = buffer_read(data, buffer_string, read);
                            console.log(get_id + " | " + get_pass + " | " + get_nickname);

                            process.send({
                                type: 'register',
                                to: 'master',
                                uuid: authenticated_users.findUserBySocket(dsocket).uuid,
                                id: get_id,
                                pass: get_pass,
                                nickname: get_nickname
                            });
                            // #endregion
                            break;

                        case signal_search:
                            // #region 내용
                            var get_type = buffer_read(data, buffer_u8, read);
                            process.send({ type: 'search', to: 'master', uuid: ins.uuid, id: get_type });
                            // #endregion
                            break;

                        case signal_move:
                            // #region 내용
                            process.send({
                                type: 'move', to: 'master',
                                uuid: ins.uuid,
                                _type: buffer_read(data, buffer_u8, read),
                                x: buffer_read(data, buffer_u16, read),
                                y: buffer_read(data, buffer_u16, read),
                                z: buffer_read(data, buffer_u16, read),
                                weapon_delay_i: buffer_read(data, buffer_s16, read),
                                weapon_range: buffer_read(data, buffer_s16, read),
                                weapon_angle: buffer_read(data, buffer_s16, read),
                                weapon_dir: buffer_read(data, buffer_s16, read),
                                weapon_xdir: buffer_read(data, buffer_s16, read),
                                move: buffer_read(data, buffer_s8, read),
                                jump: buffer_read(data, buffer_s8, read),
                                xdir: buffer_read(data, buffer_s8, read)
                            });
                            // #endregion
                            break;

                        case signal_instance:
                            // #region 내용
                            var instance_type = -1;
                            instance_type = buffer_read(data, buffer_u8, read);
                            switch (instance_type) {
                                case 0:
                                    // 공격 이펙트
                                    process.send({
                                        type: 'instance',
                                        to: 'master',
                                        index: instance_type,
                                        x: buffer_read(data, buffer_u16, read),
                                        y: buffer_read(data, buffer_u16, read),
                                        weapon_dir: buffer_read(data, buffer_s16, read),
                                        uuid: ins.uuid
                                    });
                                    break;

                                case 1:
                                    // 마법사 기본 공격
                                    process.send({
                                        type: 'instance',
                                        to: 'master',
                                        index: instance_type,
                                        x: buffer_read(data, buffer_u16, read),
                                        y: buffer_read(data, buffer_u16, read),
                                        speed: buffer_read(data, buffer_u8, read),
                                        weapon_dir: buffer_read(data, buffer_s16, read),
                                        direction: buffer_read(data, buffer_s16, read),
                                        image_speed: buffer_read(data, buffer_s16, read),
                                        sprite_index: buffer_read(data, buffer_s16, read),
                                        move: buffer_read(data, buffer_s8, read),
                                        effector: buffer_read(data, buffer_s16, read),
                                        range: buffer_read(data, buffer_s16, read),
                                        from: buffer_read(data, buffer_string, read),
                                        team: buffer_read(data, buffer_string, read),
                                        damage: buffer_read(data, buffer_s16, read),
                                        uuid: ins.uuid
                                    });
                                    break;

                                case 3:
                                    // 마법사 메테오 날리기
                                    process.send({
                                        type: 'instance',
                                        to: 'master',
                                        index: instance_type,
                                        x: buffer_read(data, buffer_u16, read),
                                        y: buffer_read(data, buffer_u16, read),
                                        speed: buffer_read(data, buffer_u8, read),
                                        weapon_dir: buffer_read(data, buffer_s16, read),
                                        direction: buffer_read(data, buffer_s16, read),
                                        image_speed: buffer_read(data, buffer_s16, read),
                                        sprite_index: buffer_read(data, buffer_s16, read),
                                        move: buffer_read(data, buffer_s8, read),
                                        effector: buffer_read(data, buffer_s16, read),
                                        range: buffer_read(data, buffer_s16, read),
                                        from: buffer_read(data, buffer_string, read),
                                        team: buffer_read(data, buffer_string, read),
                                        damage: buffer_read(data, buffer_s16, read),
                                        uuid: ins.uuid
                                    });
                                    break;

                                case 4:
                                    // 마법사 메테오 떨어뜨리기
                                    process.send({
                                        type: 'instance',
                                        to: 'master',
                                        index: instance_type,
                                        x: buffer_read(data, buffer_u16, read),
                                        y: buffer_read(data, buffer_u16, read),
                                        from: buffer_read(data, buffer_string, read),
                                        team: buffer_read(data, buffer_string, read),
                                        damage: buffer_read(data, buffer_s16, read),
                                        uuid: ins.uuid
                                    });
                                    break;
                            }
                            // #endregion
                            break;

                        case signal_hp:
                            // #region 내용
                            var get_i = buffer_read(data, buffer_s8, read);
                            var get_id = buffer_read(data, buffer_string, read);
                            process.send({ type: 'hp', to: 'master', msg: get_i, id: get_id });
                            // #endregion
                            break;

                        case signal_kill_log:
                            // #region 내용
                            process.send({ type: 'killLog', to: 'master', a: json_data.a, b: json_data.b, uuid: ins.uuid });
                            // #endregion
                            break;

                        default:
                            console.log(id);
                            break;
                    }
                    // #endregion
                }
            } catch (e) {
                console.log("- pid ".red + process.pid + "에서 에러 발생 | ".red + signal + " | ".red + e);
            }
        }
        // 다시 돌리기
        setTimeout(function () {
            processing();
        }, 1);
    }()
}