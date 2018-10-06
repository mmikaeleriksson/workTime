var gExpireTime = 365;

function firstUpdate()
{
    if (Cookies.get("allowCookies")) {
	Cookies.remove("allowCookies");
    }

    if (Cookies.get("workHours")) {
	$( "#workHours" ).val(Cookies.get("workHours"));
    }

    if (Cookies.get("lunchMinutes")) {
	$( "#lunchMinutes" ).val(Cookies.get("lunchMinutes"));
    }

    if (Cookies.get("startTime")) {
	var startTime = Cookies.get("startTime").match(/(\d{2})/g);;
	$( "#startTime" ).val(startTime[0] + ":" + startTime[1]);
    }

    if (Cookies.get("collapse")) {
	$( "#collapsable" ).collapse( "show" );
    }

    if (Cookies.get("bus")) {
	$( "#bus" ).collapse( "show" );
    }

    if (Cookies.get("busUrl")) {
	$( "#busUrl" ).val(Cookies.get("busUrl"));
	loadBusIframe();
    }

    $( ".clockpicker input" ).clockpicker({
	autoclose: true,
	afterDone: function() {
	    updateEndTime();
	}
    });

    $( "#collapsable" ).on("shown.bs.collapse", function () {
	var active = $(this).attr("id");
	Cookies.set("collapse", "1");
    });

    $( "#collapsable").on("hidden.bs.collapse", function () {
	var active = $(this).attr("id");
	Cookies.remove("collapse");
    });

    $( "#bus" ).on("shown.bs.collapse", function () {
	var active = $(this).attr("id");
	Cookies.set("bus", "1", {expires: gExpireTime});
    });

    $( "#bus").on("hidden.bs.collapse", function () {
	var active = $(this).attr("id");
	Cookies.remove("bus");
    });

    updateEndTime();
}

function updateEndTime() {
    var workHours = $( "#workHours" ).val();
    var lunchMinutes = $( "#lunchMinutes" ).val();
    var startTime = $( "#startTime" ).val();
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
    Cookies.set('workHours', workHours, { expires: gExpireTime });
    Cookies.set('lunchMinutes', lunchMinutes, { expires: gExpireTime });
    Cookies.set('startTime', startTime, { expires: gExpireTime });

    startCountUp();
}


function startCountUp() {
    var currentDate = new Date(Date.now());
    var endTime = $( "#endTime"  ).val();
    endTime = endTime.split(":");
    var lunchMinutes = $( "#lunchMinutes" ).val();
    var lunchEaten = !($( "#lunchButton" ).hasClass("notEaten"));
    var startTime = $( "#startTime" ).val();
    startTime = startTime.split(":");

    var debugCheckbox = document.getElementById("debugCheckbox").checked;
    var debugTime = $( "#debugTime" ).val();

    var startDate = new Date();
    startDate.setHours(startTime[0]);
    startDate.setMinutes(startTime[1]);

    if (debugCheckbox) {
	debugTime = debugTime.split(":");
	currentDate.setHours(parseInt(debugTime[0]));
	currentDate.setMinutes(parseInt(debugTime[1]));
    }

    var countupMinutes = Math.floor((currentDate - startDate)/60000);

    if (lunchEaten) {
	countupMinutes -= parseInt(lunchMinutes);
    }

    if (currentDate < startDate || countupMinutes < 0) {
	var clock = $('.clock').FlipClock((0), {
	});
    }
    else {
	var clock = $('.clock').FlipClock((countupMinutes * 60), {
	});
    }

    var clockValue = Math.floor(clock.getTime()/60);
    currentDate = startDate;
    currentDate.setMinutes(startDate.getMinutes() + clockValue);

    if (!lunchEaten) {
	currentDate.setMinutes(startDate.getMinutes() + parseInt(lunchMinutes));
    }

    var endDate = new Date();
    endDate.setHours(endTime[0]);
    endDate.setMinutes(endTime[1]);

    if (currentDate > endDate) {
	$( "#overtime" ).removeClass( "hidden" );
    }
    else {
	$( "#overtime" ).addClass( "hidden" );
    }
}


function toggleRemoveLunch() {
    var lunchButton = $( "#lunchButton" );

    if (lunchButton.hasClass("notEaten")) {
	lunchButton.removeClass("glyphicon-ice-lolly");
	lunchButton.removeClass("notEaten");
	lunchButton.removeClass("btn-warning");

	lunchButton.addClass("glyphicon-ice-lolly-tasted");
	lunchButton.addClass("eaten");
	lunchButton.addClass("btn-success");
	lunchButton.prop("title", "Lunch eaten")
    } else {
	lunchButton.removeClass("glyphicon-ice-lolly-tasted");
	lunchButton.removeClass("eaten");
	lunchButton.removeClass("btn-success");

	lunchButton.addClass("glyphicon-ice-lolly");
	lunchButton.addClass("notEaten");
	lunchButton.addClass("btn-warning");
	lunchButton.prop("title", "Lunch not eaten")
    }

    updateEndTime();
}


function loadBusIframe() {
    var url = $( "#busUrl" ).val();
    $( "#busIframe" ).attr('src',url);
    Cookies.set("busUrl", url);
}
