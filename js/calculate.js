function firstUpdate()
{
    if (Cookies.get("workHours")) {
	$("#workHours").val(Cookies.get("workHours"));
    }

    if (Cookies.get("lunchMinutes")) {
	$("#lunchMinutes").val(Cookies.get("lunchMinutes"));
    }

    if (Cookies.get("startTime")) {
	var startTime = Cookies.get("startTime").match(/(\d{2})/g);;
	$("#startTime").val(startTime[0] + ":" + startTime[1]);
    }

    updateEndTime();
}

function updateEndTime() {
    var workHours = $("#workHours").val();
    var lunchMinutes = $("#lunchMinutes").val();
    var startTime = $("#startTime").val();
    var endTime;

    var date = new Date(Date.now());

    startTime = startTime.split(":");

    date.setHours(startTime[0]);
    date.setMinutes(startTime[1]);

    var calcMin = (date.getMinutes() + parseInt(lunchMinutes) +
		   (parseInt(workHours) * 60));
    date.setMinutes(calcMin);

    var hours = date.getHours();
    var minutes = date.getMinutes();

    hours = (hours<10?'0':'') + hours;
    minutes = (minutes<10?'0':'') + minutes;

    $("#endTime").val(hours + ":" + minutes);

    //Cookies
    Cookies.set('workHours', workHours);
    Cookies.set('lunchMinutes', lunchMinutes);
    Cookies.set('startTime', startTime);

    startCountDown();
}


function startCountDown() {
    var currentDate = new Date(Date.now());
    var endTime = $("#endTime").val();
    endTime = endTime.split(":");

    var endDate = new Date();
    endDate.setHours(endTime[0]);
    endDate.setMinutes(endTime[1]);

    currentMinutes = ((currentDate.getHours() * 60) +
		      currentDate.getMinutes());

    endMinutes = ((endDate.getHours() * 60) +
		  endDate.getMinutes());

    var countdownMinutes = (endMinutes - currentMinutes);
    countdownMinutes = countdownMinutes < 0 ? 0 : countdownMinutes;

    if (countdownMinutes > 0) {

	$( "#overtime" ).addClass( "hidden" );
	var clock = $('.clock').FlipClock((countdownMinutes * 60), {
	    countdown: true
	});
    }
    else {
	countdownMinutes = (currentMinutes - endMinutes);

	$( "#overtime" ).removeClass( "hidden" );
	var clock = $('.clock').FlipClock((countdownMinutes * 60), {
	});
    }
}
