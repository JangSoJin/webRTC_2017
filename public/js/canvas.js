// Point 생성자 함수를 생성.
function Point(event, target) {
	this.x = event.pageX - $(target).position().left - 70;
	this.y = event.pageY - $(target).position().top - 115;
	//console.log('y축? : ', this.y);
}
			
//Canvas 리셋 버튼
function clearCANVAS(){     
	var canvas   = document.getElementById("canvas");      
	if(canvas){         
		var context = canvas.getContext('2d');        
		context.clearRect(0, 0,canvas.width , canvas.height);      
	}  
}	

/* Canvas 스크립트 */
$(document).ready(function () {
			
            // Canvas 객체를 추출.
            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');

            var width = 3;
            var opacity = 1.0;
            var pressure = 1.0;
            var color = '#000000';
            var isDown = false;
            var newPoint, oldPoint;

            // 컬러를 구성.
            $('#colorpicker').farbtastic(function (data) {
                color = data;
            });

            // 마우스로 Canvas 안에 그림을 그릴 때 이벤트를 연결함.
            canvas.addEventListener('mousedown', function (event) {	
                isDown = true;
                oldPoint = new Point(event, this);
            });
            canvas.addEventListener('mouseup', function () { 
				isDown = false; 
			});
            canvas.addEventListener('mousemove', function (event) {	
                if (isDown) {
                    newPoint = new Point(event, this);
                    socket.emit('draw', {
                        width: width,
                        color: color,
                        x1: oldPoint.x,
                        y1: oldPoint.y,
                        x2: newPoint.x,
                        y2: newPoint.y
                    });
                    oldPoint = newPoint;
                }
            });
			
			//두께를 조정.
            $('#sliderA').change(function () {
                width = $(this).val();
            });
			//투명도를 조정.
            $('#sliderB').change(function () {
                opacity = $(this).val() / 100;
            });

            // 소켓 이벤트를 연결.
			//Canvas는 RTCPeerconnection을 이용하지 않고 소켓 이벤트 연결로 통신이 되게 함.
            var socket = io();
           
            socket.on('line', function (data) {
                context.lineWidth = data.width;
                context.strokeStyle = data.color;
                context.globalAlpha = opacity * pressure;
                context.beginPath();
                context.moveTo(data.x1, data.y1);
                context.lineTo(data.x2, data.y2);
                context.stroke();
            });
});