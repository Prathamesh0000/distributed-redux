

function createObject() {
	let groupId = "ObjectId" + Math.floor(Math.random() * 10000);
	console.log("GroupId: " + groupId);

	var group = connectToGroup(groupId, (data) => {
		console.log(data)
	}, (err) => {
		console.error(err);
	})	

	var og = {};
	var obj = Introspected.observe(og, 
		(data) => {
			console.log(data);
			group.send(JSON.stringify(obj));
		});
	

	return obj;
}


function connectToGroup(groupId, updates, err) {
	var userID = "User" + Math.floor(Math.random() * 10000);
	
	var group = new PeerGroup(err, {
		host: 'localhost',
		port: 9000,
		path: '/myapp'
	  });
	
	group.addEventListener('message', function (event) {
		updates(event.message);
	});
	
	group.addEventListener('joined', function (event) {
		console.log('Greetings from ' + userID);
	});

	group.connect(groupId, userID);
	return group;
}







