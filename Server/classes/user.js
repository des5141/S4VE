var uuid_v4 = require('uuid-v4');

function create(uuid, id) {
    if (uuid == 0) {
        uuid = uuid_v4();
    } else if (uuid == -1) {
        uuid = -1;
    }
    //Interface
    return {
        hp: 100,
        maxhp: 100,
        sp: 100,
        maxsp: 100,
        attack: 0,
        delay: 0,
        defence: 0,
        speed: 2.5,


        uuid: uuid, // UUID
        nickname: "null",      // User Nickname\
        room: "null",      // User's room
        room_i: -1,
        id: id,    // User's id
        team: "",
        x: 0,
        y: 0,
        z: 0,
        respawn: -1,
        _type: 0,
        weapon_delay_i: -100,
        weapon_range: 0,
        weapon_angle: 0,
        image_xscale: 1,
        move: 0,
        jump: 0,
        weapon_dir: 0,
        weapon_xdir: 0,
        xdir: 0,
        engagement: -1
    };
}

module.exports.create = create;