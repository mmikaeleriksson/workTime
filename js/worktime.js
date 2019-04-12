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
	const startTime = Cookies.get("startTime").match(/(\d{2})/g);;
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
	Cookies.set("collapse", "1");
    });

    $( "#collapsable").on("hidden.bs.collapse", function () {
	Cookies.remove("collapse");
    });

    $( "#bus" ).on("shown.bs.collapse", function () {
	Cookies.set("bus", "1", {expires: gExpireTime});
    });

    $( "#bus").on("hidden.bs.collapse", function () {
	Cookies.remove("bus");
    });

    $( "#workHours" ).on("input", updateEndTime);
    $( "#lunchMinutes" ).on("input", updateEndTime);
    $( "#startTime" ).on("input", updateEndTime);

    if (Cookies.get("lunchButton")) {
	toggleRemoveLunch();
    }

    updateEndTime();
}

function updateEndTime() {
    const workHours = $( "#workHours" ).val();
    const lunchMinutes = $( "#lunchMinutes" ).val();
    let startTime = $( "#startTime" ).val();

    let date = new Date(Date.now());
    startTime = startTime.split(":");

    date.setHours(startTime[0]);
    date.setMinutes(startTime[1]);

    const calcMin = (date.getMinutes() + parseInt(lunchMinutes) +
		   (parseInt(workHours) * 60));
    date.setMinutes(calcMin);

    let hours = date.getHours();
    let minutes = date.getMinutes();

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
    let currentDate = new Date(Date.now());
    const lunchMinutes = $( "#lunchMinutes" ).val();
    const lunchEaten = !($( "#lunchButton" ).hasClass("notEaten"));
    let startTime = $( "#startTime" ).val();
    startTime = startTime.split(":");

    let startDate = new Date();
    startDate.setHours(startTime[0]);
    startDate.setMinutes(startTime[1]);

    let countupMinutes = Math.floor((currentDate - startDate)/60000);

    if (lunchEaten) {
	countupMinutes -= parseInt(lunchMinutes);
    }

    if (currentDate < startDate || countupMinutes < 0) {
	$('.clock').FlipClock((0), {});
    }
    else {
	$('.clock').FlipClock((countupMinutes * 60), {});
    }

    const workHours = $( "#workHours" ).val();
    let workMinutes = (workHours * 60);

    if (countupMinutes > workMinutes) {
	$( "#overtime" ).removeClass( "hidden" );
    }
    else {
	$( "#overtime" ).addClass( "hidden" );
    }
}


function toggleRemoveLunch() {
    let lunchButton = $( "#lunchButton" );

    if (lunchButton.hasClass("notEaten")) {
	Cookies.remove("lunchButton");

	//CSS
	lunchButton.removeClass("glyphicon-ice-lolly");
	lunchButton.removeClass("notEaten");
	lunchButton.removeClass("btn-warning");

	lunchButton.addClass("glyphicon-ice-lolly-tasted");
	lunchButton.addClass("eaten");
	lunchButton.addClass("btn-success");
	lunchButton.prop("title", "Lunch eaten")
    }
    else {
	let halfADay = 0.5;
	Cookies.set("lunchButton", "1", {expires: halfADay});


	//CSS
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
    const url = $( "#busUrl" ).val();
    $( "#busIframe" ).attr('src',url);
    Cookies.set("busUrl", url, {expires: gExpireTime});
}
