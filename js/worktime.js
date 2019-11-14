function getSafeValue(id, safeVal = 0) {
    return $(id).val() || safeVal;
}

function firstUpdate() {
    addEventListenersToNavButtons();

    if (localStorage.getItem("theme")) {
        document.documentElement.setAttribute(
            "data-theme",
            localStorage.getItem("theme")
        );

        if (localStorage.getItem("theme") == "light") {
            document.getElementById("dispButton").classList.add("btn-dark");
            document
                .getElementById("dispButton")
                .setAttribute("title", "Switch to Dark Mode");
            document.querySelector(".color").classList.add("fa-moon");
        }
        else {
            document.getElementById("dispButton").classList.add("btn-light");
            document
                .getElementById("dispButton")
                .setAttribute("title", "Switch to Light Mode");
            document.querySelector(".color").classList.add("fa-sun");
        }
    }
    else {
        getDefaultModeColor();
    }

    if (halfADayHasPassed()) {
        localStorage.removeItem("lunchButton");
    }

    if (localStorage.getItem("workHours")) {
        $("#workHours").val(localStorage.getItem("workHours"));
    }

    if (localStorage.getItem("lunchMinutes")) {
        $("#lunchMinutes").val(localStorage.getItem("lunchMinutes"));
    }

    if (localStorage.getItem("startTime")) {
        const startTime = localStorage.getItem("startTime").match(/(\d{2})/g);
        $("#startTime").val(startTime[0] + ":" + startTime[1]);
    }

    if (localStorage.getItem("collapse")) {
        $("#collapsable").collapse("show");
    }

    if (localStorage.getItem("bus")) {
        $("#bus").collapse("show");
    }

    if (localStorage.getItem("busUrl")) {
        $("#busUrl").val(localStorage.getItem("busUrl"));
        loadBusIframe();
    }

    if (localStorage.getItem("timeRemainingSwitch")) {
        switchTimeCount();
    }
    else {
        updateTimeRemainingSwitch();
    }

    $(".clockpicker input").clockpicker({
        autoclose: true,
        afterDone: function() {
            updateEndTime();
        }
    });

    $("#collapsable").on("shown.bs.collapse", function() {
        localStorage.setItem("collapse", "1");
    });

    $("#collapsable").on("hidden.bs.collapse", function() {
        localStorage.removeItem("collapse");
    });

    $("#bus").on("shown.bs.collapse", function() {
        localStorage.setItem("bus", "1");
    });

    $("#bus").on("hidden.bs.collapse", function() {
        localStorage.removeItem("bus");
    });

    $("#debugTime").on("input", updateEndTime);
    $("#workHours").on("input", updateEndTime);
    $("#lunchMinutes").on("input", updateEndTime);
    $("#startTime").on("input", updateEndTime);
    $("#timeRemainingSwitch").on("click", switchTimeCount);

    if (localStorage.getItem("lunchButton")) {
        toggleRemoveLunch();
    }

    if (getUrlParameter("debug")) {
        enableDebug();
    }

    $("#debugSwitch").click(function() {
        toggleDebugParameter();
    });

    $("#timeRemainingSwitch").click(function() {
        updateClock();
    });

    updateEndTime();
}

function updateEndTime() {
    const workHours = getSafeValue("#workHours");
    const lunchMinutes = getSafeValue("#lunchMinutes");
    let startTime = getSafeValue("#startTime", "00:00");

    let date = new Date(Date.now());
    startTime = startTime.split(":");

    date.setHours(startTime[0]);
    date.setMinutes(startTime[1]);

    const calcMin = (date.getMinutes() + parseInt(lunchMinutes) +
                     parseInt(workHours) * 60);
    date.setMinutes(calcMin);

    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;

    $("#endTime").val(hours + ":" + minutes);

    localStorage.setItem("workHours", workHours);
    localStorage.setItem("lunchMinutes", lunchMinutes);
    localStorage.setItem("startTime", startTime);

    updateClock();
}

function getDefaultModeColor() {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (isDarkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("dispButton").classList.add("btn-light");
        document.querySelector(".color").classList.remove("fa-moon");
        document.querySelector(".color").classList.add("fa-sun");
    }
    else {
        document.documentElement.setAttribute("data-theme", "light");
        document.getElementById("dispButton").classList.add("btn-dark");
        document.querySelector(".color").classList.remove("fa-sun");
        document.querySelector(".color").classList.add("fa-moon");
    }
}

function getWorkedMinutes(startDate, currentDate) {
    const lunchMinutes = $("#lunchMinutes").val();
    const lunchEaten = !$("#lunchButton").hasClass("notEaten");
    let countupMinutes = Math.floor((currentDate - startDate) / 60000);

    if (lunchEaten) {
        countupMinutes -= parseInt(lunchMinutes);
    }
    return countupMinutes;
}

function getStartDate() {
    let startTime = $("#startTime").val();
    startTime = startTime.split(":");

    let startDate = new Date();
    startDate.setHours(startTime[0]);
    startDate.setMinutes(startTime[1]);

    return startDate;
}

function updateClock() {
    let countDown =
        $("#timeRemainingSwitch").children('i').hasClass("fa-toggle-on");

    let currentDate = new Date(Date.now());
    const debugCheckbox = document.getElementById("debugCheckbox").checked;
    let debugTime = $( "#debugTime" ).val();
    let startDate = getStartDate();

    if (debugCheckbox) {
        debugTime = debugTime.split(":");
        currentDate.setHours(parseInt(debugTime[0]));
        currentDate.setMinutes(parseInt(debugTime[1]));
    }

    let countupMinutes = getWorkedMinutes(startDate, currentDate);
    const workHours = $("#workHours").val();
    let workMinutes = workHours * 60;

    if (countDown) {
        let remaining =  workMinutes - countupMinutes;
        if (remaining < 0) remaining = 0;

        $(".clock").FlipClock(remaining * 60 + 60, {countdown: true});
    }
    else {
        if (currentDate < startDate || countupMinutes < 0) {
            $(".clock").FlipClock(0, {});
        }
        else {
            $(".clock").FlipClock(countupMinutes * 60, {});
        }
    }

    if (countupMinutes > workMinutes) {
        $("#overtime").removeClass("hidden");
    }
}

function switchTimeCount() {
    let icon = $("#timeRemainingSwitch > .fas");
    let text = $("#timeRemainingSwitch").children('h4');

    if (icon.hasClass("fa-toggle-off")) {
        icon.removeClass("fa-toggle-off");
        icon.addClass("fa-toggle-on");
    }
    else {
        icon.removeClass("fa-toggle-on");
        icon.addClass("fa-toggle-off");
    }

    updateTimeRemainingSwitch();
}

function updateTimeRemainingSwitch() {
    let icon = $("#timeRemainingSwitch > .fas");
    let text = $("#timeRemainingSwitch").children('h4');

    if (icon.hasClass("fa-toggle-off")) {
        text.html("Time worked");
        localStorage.removeItem("timeRemainingSwitch");
    }
    else {
        text.html("Time remaining");
        localStorage.setItem("timeRemainingSwitch", true);
    }
}

function getTime() {
    // get current date @click
    let date = new Date();
    // return current time in UNIX
    return date.getTime();
}

function halfADayHasPassed() {
    let now = getTime();
    // get time already in storage, no return val should result in NaN
    const prevTime = parseInt(localStorage.getItem("lunchButton"));

    return now > prevTime + 12 * 60 * 60;
}

function toggleRemoveLunch() {
    let lunchButton = $("#lunchButton");
    let lunchIcon = $(".foodIcon");

    if (lunchButton.hasClass("notEaten")) {
        let now = getTime();
        // get time already in storage, no return val should result in NaN
        const prevTime = parseInt(localStorage.getItem("lunchButton"));

        if (!prevTime) {
            localStorage.setItem("lunchButton", now);
        }

        //CSS
        lunchIcon.removeClass("fa-cookie");
        lunchButton.removeClass("notEaten");
        lunchButton.removeClass("btn-warning");

        lunchIcon.addClass("fa-cookie-bite");
        lunchButton.addClass("eaten");
        lunchButton.addClass("btn-success");
        lunchButton.prop("title", "Lunch eaten");
    }
    else {
        localStorage.removeItem("lunchButton");

        //CSS
        lunchIcon.removeClass("fa-cookie-bite");
        lunchButton.removeClass("eaten");
        lunchButton.removeClass("btn-success");

        lunchIcon.addClass("fa-cookie");
        lunchButton.addClass("notEaten");
        lunchButton.addClass("btn-warning");
        lunchButton.prop("title", "Lunch not eaten");
    }

    updateEndTime();
}

function loadBusIframe() {
    const url = $("#busUrl").val();
    $("#busIframe").attr("src", url);
    localStorage.setItem("busUrl", url);
}

function toggleColorMode() {
    let toggleButton = document.getElementById("dispButton");

    if (document.documentElement.getAttribute("data-theme") == "light") {
        document.documentElement.setAttribute("data-theme", "dark");

        toggleButton.classList.remove("btn-dark");
        toggleButton.classList.add("btn-light");

        toggleButton.setAttribute("title", "Switch to Light Mode");

        document.querySelector(".color").classList.remove("fa-moon");
        document.querySelector(".color").classList.add("fa-sun");
    }
    else {
        document.documentElement.setAttribute("data-theme", "light");

        toggleButton.classList.remove("btn-light");
        toggleButton.classList.add("btn-dark");

        toggleButton.setAttribute("title", "Switch to Dark Mode");

        document.querySelector(".color").classList.remove("fa-sun");
        document.querySelector(".color").classList.add("fa-moon");
    }

    localStorage.setItem(
        "theme",
        document.documentElement.getAttribute("data-theme")
    );
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }

    return undefined;
}

function toggleDebugParameter() {
    let url = document.location.href;

    if (getUrlParameter("debug")) {
        let debugParameter = "&debug=true";

        if (url.includes("?debug=true")) {
            debugParameter="?debug=true";
        }

        url = url.replace(debugParameter,'');
    }
    else {
        let debugParameter;

        if (url.includes('?')) {
            debugParameter = "&debug=true";
        }
        else{
            debugParameter= "?debug=true";
        }

        url += debugParameter;
    }

    document.location = url;
}

function enableDebug() {
    $("#debugContainer").removeClass("hidden");

    let icon = $("#debugSwitch > .fas");
    icon.removeClass("fa-toggle-off");
    icon.addClass("fa-toggle-on");
}

/**
 * This function is used to switch between the tabs. Setting the one that was clicked on as
 * current active and showing its contents while hiding the content of the rest.
 * @param HTMLEvent event
 * @param string tabName
 */
function openTab(event, tabName) {
    //get contentTabs and convert to array and hide them all
    let contentTabs = [...document.getElementsByClassName("tabContent")];
    contentTabs.forEach(contentTab => {
        contentTab.style.display = "none";
    });

    //remove class active form all navButtons
    let navButtons = [...document.getElementsByClassName("navButton")];
    navButtons.forEach(navButton => {
        navButton.classList.remove("active");
    });

    //show selected tab contents and set clicked nav button as active
    document.getElementById(tabName).style.display = "inline-block";
    event.currentTarget.classList.add("active");
}

/**
 * This function adds event listeners to navigation buttons for them to function as intended
 */
function addEventListenersToNavButtons() {
    let navButtons = [...document.getElementsByClassName("navButton")];
    navButtons.forEach(navButton => {
        navButton.addEventListener("click", function(event) {
            //call openTab with event and tabName to switch active tab and contents
            openTab(event, navButton.innerHTML.trim());
        });
    });
}
