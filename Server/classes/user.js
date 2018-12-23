var uuid_v4 = require('uuid-v4');

function create(uuid, socket, id) {
    if (uuid == 0) {
        uuid = uuid_v4();
    } else if(uuid == -1){
        uuid = -1;
    }
	//Interface
	return {
		uuid   : uuid, // UUID
		name   : "null",      // User Nickname
		socket : socket,    // User's socket
		room   : "null",      // User's room
        id     : id,    // User's id
		x      : 0,
		y      : 0,
        image_xscale: 1
	};
}

module.exports.create = create;