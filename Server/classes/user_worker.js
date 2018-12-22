var uuid_v4 = require('uuid-v4');

function create(uuid, socket) {
    if (uuid == 0) {
        uuid = uuid_v4();
    } else if(uuid == -1){
        uuid = -1;
    }
	//Interface
	return {
		uuid   : uuid, // UUID
		socket : socket, // User's socket
        login  : -1
	};
}

module.exports.create = create;