<!-- 스크린 공유 스크립트 -->
        var screenContainer = document.getElementById('screens-container') || document.body;
		var screeninfo = document.getElementById('screen-info');
        var screensharing = new Screen();

        screensharing.onscreen = function(_screen){
            var alreadyExist = document.getElementById(_screen.userid);
            if(alreadyExist) return;

            if(typeof roomsList === 'undefined')
                roomsList = document.body;

            /*var tr = document.createElement('tr');
			
            tr.id = _screen.userid;
            tr.innerHTML = '<h1>' + _screen.userid + ' shared his screen.</h1><br>' +
                '<h3><button class="join">상대방 스크린 보기</button></h3>';
            roomsList.insertBefore(tr, roomsList.firstChild);

            var button = tr.querySelector('.join');
            button.setAttribute('data-userid', _screen.userid);
            button.setAttribute('data-roomid', _screen.roomid);
            button.onclick = function(){
                var button = this;
                button.disabled = true;

                var _screen = {
                    userid: button.getAttribute('data-userid'),
                    roomid: button.getAttribute('data-roomid')
                };
                screensharing.view(_screen);
            };
			*/
			
			screeninfo.id = _screen.userid;
			
			screeninfo.innerHTML = '<h3>상대방이 화면을 공유합니다.</h3>' +
									'<h3><button class="join">상대방 스크린 보기</button></h3>';
									
			//roomsList.insertBefore(screeninfo, roomsList.firstChild);
			
			var button = screeninfo.querySelector('.join');
			button.setAttribute('data-userid', _screen.userid);
			button.setAttribute('data-roomid', _screen.roomid);
			button.onclick = function(){
				var button = this;
				button.disabled = true;
				
				var _screen = {
					userid: button.getAttribute('data-userid'),
					roomid: button.getAttribute('data-roomid')
				};
				screensharing.view(_screen);
			};
        };

        // 새 스크린 받기
        screensharing.onaddstream = function(media){
            media.video.id = media.userid;
			
            var video = media.video;
            video.width = 1000;
            video.setAttribute('controls', true);
            screenContainer.insertBefore(video, screenContainer.firstChild);
            video.play();
        };

        // 누군가 나갔을 때, 그냥 그 스크린만 지우기
        screensharing.onuserleft = function(userid){
            var video = document.getElementById(userid);
            if(video && video.parentNode) video.parentNode.removeChild(video);
        };

        //공유되고있는 스크린 체크
        screensharing.check();

        //스크린 공유 버튼 눌렀을 때	user이름 값 받고 공유 시작.
        document.getElementById('share-screen').onclick = function(){
            screensharing.share();
            this.disabled = true;
        };

        document.getElementById('share-screen').onclick = function(){

            screensharing.isModerator = true;

            screensharing.share();
        };

        //스크린 공유 사용자 수 세기
        screensharing.onNumberOfParticipantsChanged = function(numberOfParticipants){
            if(!screensharing.isModerator) return;

            document.title = numberOfParticipants + ' 사용자가 당신의 스크린을 보고있습니다!';
            var element = document.getElementById('number-of-participants');
            if(element){
                element.innerHTML = numberOfParticipants + ' 사용자가 당신의 스크린을 보고있습니다!';
            }
        };