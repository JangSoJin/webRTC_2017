
var gravatar = require('gravatar');

module.exports = function(app,io){

	app.get('/', function(req, res){

		// 쳐음엔 views/home.html 으로 렌더링함
		res.render('home');
	});


	app.post('/create', function(req,res){
		
		console.log(req.body);
		
		var id = req.body.roomnameInput;	
		
		res.redirect('/'+id);
	});

	app.get('/:id', function(req,res){

		res.render('conference');
	});

	
	var conference = io.on('connection', function (socket) {
		
		/* -------------5명 이상 못들어오게 인원수 조절 잊지말기---------------*/

		// chat.js 에서 load 이벤트를 발생시키면 여기서 처리함. 방 이름 입력하고 난 직후. 자신 이름 입력하기 직전.
		socket.on('load',function(data){

			var room = findClientsSocket(io,data);	
			//console.log(room);
			console.log('들어온 사람 수 : ', room.length+1);
			
			if(room.length === 0 ) {
				
				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length > 0) {	//들어와 있는 사람 수가 1명 이상이라면
				
				socket.emit('peopleinchat', {
					number: room.length,
					user: room[0].username,	//이미 같은 이름이 있는지 검사하기 위해 이 user 값을 보냄 (room.username 값을 모두 보내야하므로 수정해야함)
					avatar: room[0].avatar,
					id: data
				});
			}
			//else if(room.length >= 8) {
				
				//conference.emit('tooMany', {boolean: true});
			//}
		});

		// 사용자가 login 이벤트를 발생시킬때, 그 사용자의 이름을 저장하고 방에 추가시킴.
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id);
		
			
			// 일단 8명까지 인원수 제한해둠.
			if (room.length < 9) {

				// data를 저장하기 위해 socket객체를 이용함. 각 사용자들의 자신만의 socket 객체를 가지고 있뜸.
				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

				// Tell the person what he should use for an avatar
				socket.emit('img', socket.avatar);

				// 사용자를 방에 추가
				socket.join(data.id);
				
				if (room.length >= 1) {		//if(room.length == 1)
				
			
					var usernames = [],avatars = [];
						
	
					//지금 1:1만 구현되어 있어서 room[0].username 과 socket.username만 push 되어있음.
					// room배열 안에있는 모든 username 들을 push 해야함.
					usernames.push(room[0].username);
					usernames.push(socket.username);

					//avatars.push(room[0].avatar);
					//avatars.push(socket.avatar);

					
				
					conference.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
				
				
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// 방을 나갔을 때
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){

			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
		
		socket.on('draw', function (data) {
			io.sockets.in(socket.room).emit('line', data);
		});
		
		
		
		
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // 기본 namespace 는 "/" 임.

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	
	return res;
}


