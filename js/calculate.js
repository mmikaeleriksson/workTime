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
}
