function create() {
	var users = new Array(); //Internal list of users

	//Add a user
	function addUser(user) {
		users[user.uuid] = user;
	}
	
	//Remove a user
	function removeUserData(uuid) {
		delete users[uuid];
	}
	
	//Find a user by UUID
	function findUser(uuid) {
		return users[uuid];
	}
	
	//Find a user by socket
	function findUserBySocket(socket) {
		for (uuid in users) {
			if (users[uuid].socket == socket) {
				return users[uuid];
			}
        }
	}
	
	//Utility function for iterating through users
	function each(f) {
		for (uuid in users) {
			f(users[uuid]);
		}
	}
	
	//Interface
	return {
		users: users,
		addUser: addUser,
		removeUserData: removeUserData,
		findUser: findUser,
		findUserBySocket: findUserBySocket,
		each: each
	};
}

module.exports.create = create;