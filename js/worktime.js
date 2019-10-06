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
		} else {
			document.getElementById("dispButton").classList.add("btn-light");
			document
				.getElementById("dispButton")
				.setAttribute("title", "Switch to Light Mode");
			document.querySelector(".color").classList.add("fa-sun");
		}
	} else {
		getDefaultModeColor();
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

	$(".clockpicker input").clockpicker({
		autoclose: true,
		afterDone: function() {
			updateEndTime();
		},
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

	$("#workHours").on("input", updateEndTime);
	$("#lunchMinutes").on("input", updateEndTime);
	$("#startTime").on("input", updateEndTime);

	if (localStorage.getItem("lunchButton")) {
		toggleRemoveLunch();
	}

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

	const calcMin =
		date.getMinutes() + parseInt(lunchMinutes) + parseInt(workHours) * 60;
	date.setMinutes(calcMin);

	let hours = date.getHours();
	let minutes = date.getMinutes();

	hours = (hours < 10 ? "0" : "") + hours;
	minutes = (minutes < 10 ? "0" : "") + minutes;

	$("#endTime").val(hours + ":" + minutes);

	localStorage.setItem("workHours", workHours);
	localStorage.setItem("lunchMinutes", lunchMinutes);
	localStorage.setItem("startTime", startTime);

	startCountUp();
}

function getDefaultModeColor() {
	const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

	if (isDarkMode) {
		document.documentElement.setAttribute("data-theme", "dark");
		document.getElementById("dispButton").classList.add("btn-light");
		document.querySelector(".color").classList.remove("fa-moon");
		document.querySelector(".color").classList.add("fa-sun");
	} else {
		document.documentElement.setAttribute("data-theme", "light");
		document.getElementById("dispButton").classList.add("btn-dark");
		document.querySelector(".color").classList.remove("fa-sun");
		document.querySelector(".color").classList.add("fa-moon");
	}
}

function startCountUp() {
	let currentDate = new Date(Date.now());
	const lunchMinutes = $("#lunchMinutes").val();
	const lunchEaten = !$("#lunchButton").hasClass("notEaten");
	let startTime = $("#startTime").val();
	startTime = startTime.split(":");

	let startDate = new Date();
	startDate.setHours(startTime[0]);
	startDate.setMinutes(startTime[1]);

	let countupMinutes = Math.floor((currentDate - startDate) / 60000);

	if (lunchEaten) {
		countupMinutes -= parseInt(lunchMinutes);
	}

	if (currentDate < startDate || countupMinutes < 0) {
		$(".clock").FlipClock(0, {});
	} else {
		$(".clock").FlipClock(countupMinutes * 60, {});
	}

	const workHours = $("#workHours").val();
	let workMinutes = workHours * 60;

	if (countupMinutes > workMinutes) {
		$("#overtime").removeClass("hidden");
	} else {
		$("#overtime").addClass("hidden");
	}
}

function toggleRemoveLunch() {
	let lunchButton = $("#lunchButton");
	let lunchIcon = $(".foodIcon");

	if (lunchButton.hasClass("notEaten")) {
		let halfADay = 0.5;
		localStorage.setItem(
			"lunchButton",
			JSON.stringify("1", { expires: halfADay })
		);

		//CSS
		lunchIcon.removeClass("fa-cookie");
		lunchButton.removeClass("notEaten");
		lunchButton.removeClass("btn-warning");

		lunchIcon.addClass("fa-cookie-bite");
		lunchButton.addClass("eaten");
		lunchButton.addClass("btn-success");
		lunchButton.prop("title", "Lunch eaten");
	} else {
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
	localStorage.setItem("busUrl", JSON.stringify(url));
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
	} else {
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
