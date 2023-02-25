function getTimeRemaining(endtime) {
	let t = Date.parse(endtime) - Date.parse(new Date());
	let seconds = Math.floor((t / 1000) % 60);
	let minutes = Math.floor((t / 1000 / 60) % 60);
	let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
	let days = Math.floor(t / (1000 * 60 * 60 * 24));
	return {
		total: t,
		days: days,
		hours: hours,
		minutes: minutes,
		seconds: seconds
	};
}

function initializeClock(id, endtime) {

	function updateClock() {
		var t = getTimeRemaining(endtime);

		if (t.total <= 0) {
			clearInterval(timeinterval);
			var deadline = new Date(Date.parse(new Date()) + 13500 * 1000);
			initializeClock('clockdiv', deadline);
		}

		let clock = document.querySelectorAll('.time-remain').forEach(item => {
			item.querySelector(".hour").innerHTML = ("0" + t.hours).slice(-2);
			item.querySelector(".minutes").innerHTML = ("0" + t.minutes).slice(-2);
			item.querySelector(".seconds").innerHTML = ("0" + t.seconds).slice(-2);
		});
	}
	updateClock();
	var timeinterval = setInterval(updateClock, 1000);
}
var deadline = new Date(Date.parse(new Date()) + 13500 * 1000);
initializeClock("clockdiv", deadline);

let smoothLinks = document.querySelectorAll('a:not(.js-noscroll)');
for (let smoothLink of smoothLinks) {
	smoothLink.onclick = function() {
			smoothLink.setAttribute("href", "#form");
	};
};
