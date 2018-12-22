var uuid_v4 = require('uuid-v4');

function create(uuid, name, socket) {
    if (uuid == 0) {
        uuid = uuid_v4();
    } else if(uuid == -1){
        uuid = -1;
    }
	//Interface
	return {
		uuid   : uuid, // UUID
		name   : name,      // User Nickname
		socket : socket,    // User's socket
		room   : room,      // User's room
        id     : "null",    // User's id
		x      : 0,
		y      : 0,
        image_xscale: 1,
        mine   : 0
	};
}

module.exports.create = create;