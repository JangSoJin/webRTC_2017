

$(function(){

	// url을 통해서 roomid 값 얻어오기
	//var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);
	var originurl = window.location.href;
	var spliturl = originurl.split("/");
	var urllength = spliturl.length;
	var id = spliturl[urllength-1];
	var my_cnt = 0;
	var flag = false;
	var painter_cnt = 0;
	var file_cnt = 0;
	var sharing_cnt = 0;

	console.log('방 이름 : ',id);

    var connection = new RTCMultiConnection();	//RTCMultiConnection 객체 받아오기.

	var videosContainer = document.getElementById('videos-container') || document.body;
	
	// connect to the socket
	var socket = io();

    // variables which hold the data for each person
	var name = "",
		email = "",
		roomname="",
		img = "",
		friend = "";

	// cache some jQuery objects
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	var videoContents = $(".video-contents");

	var painter = $("#painter"),
		screenSharing = $("#sharing"),
		fileTransfer = $("#file_transfer");

	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	// on connection to server get the id of person's room
	socket.on('connect', function(){

		socket.emit('load', id);
	});

	// save the gravatar url
	socket.on('img', function(data){
		img = data;
	});

	// receive the names and avatars of all people in the chat room
	socket.on('peopleinchat', function(data){

		if(data.number === 0){

			showMessage("connected");

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(yourName.val());
				
				if(name.length < 1){
					alert("1글자 이상의 이름을 적어주세용");
					return;
				}

				//email = yourEmail.val();

                showMessage("inviteSomebody");

				// login 이벤트를 발생시키고 사용자에 대한 정보들을 보냄.
				socket.emit('login', {user: name, avatar: email, id: id});
				
			
			});
		}

		else if(data.number >= 1) {

			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());

				if(name.length < 1){
					alert("1글자 이상의 이름을 적어주세용");
					return;
				}

				if(name == data.user){
					alert("There already is a \"" + name + "\" in this room!");
					return;
				}
				
				
				//email = hisEmail.val();

                socket.emit('login', {user: name, avatar: email, id: id});
				

			});
		}

		else {
			showMessage("tooManyPeople");
		}

	});

	// Other useful 

	socket.on('startChat', function(data){
		console.log(data);
		if(data.boolean && data.id == id) {

			//chats.empty();

			if(name === data.users[0]) {//처음 방에 들어온 사람

				showMessage("youStartedChatWithNoMessages",data);
            }
			else {

				showMessage("heStartedChatWithNoMessages",data);
			}

			chatNickname.text(roomname);
		}
	});

	//사용자가 나갔을 때
	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			//chats.empty();//-------------------------------
		}

	});

	socket.on('tooMany', function(data){

		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){

		showMessage('chatStarted');

		if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
	});

	textarea.keypress(function(e){

		// Submit the form on enter

		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();

			// Send the message to the other person in the chat
			socket.emit('msg', {msg: textarea.val(), user: name, img: img});

		}
		// Empty the textarea
		textarea.val("");
	});

	// Update the relative time stamps on the chat messages every minute

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Function that creates a new chat message

	function createChatMessage(msg, user, imgg, now){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	// 이메일이 유효한지 검사하는 함수 ( 없애버릴 예정 )
	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	// ----------------- 여기서 부터 div 들 보여주기 -------------------
	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			// Set the invite link content
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
        }

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
				});
			});
			friend = data.users[1];
			roomname = data.id;
			noMessagesImage.attr("src",data.avatars[1]);
            flag = true;
            setTimeout(function(){section.children().css('display','none')},5000);
            connection.open(id);
			connection.onstream = function(e) {
				e.mediaElement.width = 300;
				videosContainer.insertBefore(e.mediaElement, videosContainer.firstChild);
      
			};
        }

		else if(status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
			});

			friend = data.users[0];
            roomname = data.id;
            noMessagesImage.attr("src",data.avatars[0]);
            flag = true;
            setTimeout(function(){section.children().css('display','none')},5000);
            connection.join(id);
            connection.onstream = function(e) {
				e.mediaElement.width = 300;
				videosContainer.insertBefore(e.mediaElement, videosContainer.firstChild);
      
			};
        }

		else if(status === "chatStarted"){
			section.children().css('display','none');
			flag = true;
        }

		else if(status === "somebodyLeft"){

			//leftImage.attr("src",data.avatar);
			//leftNickname.text(data.user);

			//section.children().css('display','none');
			//footer.css('display', 'none');
			//left.fadeIn(1200);
			flag = false;
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
			flag = false;
		}
	}

    // Closes the sidebar menu
    $("#menu-close").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").toggleClass("active");
    });

    // Opens the sidebar menu
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper").toggleClass("active");
    });

    $("#chat-close").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper1").toggleClass("active");
        if(my_cnt%2 === 0 && flag === true) {
            footer.fadeIn(1200);
            chatScreen.fadeIn(1200);
        }
        else if(my_cnt%2 === 1 && flag === true){
            footer.fadeOut(1200);
            chatScreen.fadeOut(1200);
        }
        my_cnt++;
    });

    // Opens the sidebar menu
    $("#chat-toggle").click(function(e) {
        e.preventDefault();
        $("#sidebar-wrapper1").toggleClass("active");
        footer.fadeOut(1800);
        chatScreen.fadeOut(1800);
    });

    painter.click(function(e){
    	e.preventDefault();
		if(painter_cnt%2 === 0){
			$('.canvas-content').fadeIn(1200);
		}
		else if(painter_cnt%2 === 1){
            $('.canvas-content').fadeOut(1200);
        }
        painter_cnt++;
	});

    fileTransfer.click(function(e){
        e.preventDefault();
        if(file_cnt%2 === 0){
            $('.file_content').fadeIn(1200);
        }
        else if(file_cnt%2 === 1){
            $('.file_content').fadeOut(1200);
        }
        file_cnt++;
    });

    screenSharing.click(function(e){
        e.preventDefault();
        if(sharing_cnt%2 === 0) {
            $('.video-sharing').fadeIn(1200);
        }
        else if(sharing_cnt%2 === 1){
            $('.video-sharing').fadeOut(1200);
        }
        sharing_cnt++;
    });

});
