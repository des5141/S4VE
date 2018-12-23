function create() {
	var users = new Array(); //Internal list of users

	//Add a user
	function addUser(user) {
		users[user.id] = user;
	}
	
	//Remove a user
	function removeUser(id) {
		delete users[id];
	}
	
	//Find a user by UUID
	function findUser(id) {
		return users[id];
	}
	
	//Find a user by name
	function findUserByName(name) {
		for (id in users) {
			if (users[id].name == name) {
				return users[id];
			}
		}
    }

    //Find a user by id
    function findUserById(id) {
        for (id in users) {
            if (users[id].id == id) {
                return users[id];
            }
        }
    }
	
	//Find a user by socket
	function findUserBySocket(socket) {
		for (id in users) {
			if (users[id].socket == socket) {
				return users[id];
			}
		}
	}
	
	//Utility function for iterating through users
	function each(f) {
		for (id in users) {
			f(users[id]);
		}
	}
	
	//Interface
	return {
		users: users,
		addUser: addUser,
		removeUser: removeUser,
		findUser: findUser,
        findUserByName: findUserByName,
        findUserById: findUserById,
		findUserBySocket: findUserBySocket,
		each: each
	};
}

module.exports.create = create;