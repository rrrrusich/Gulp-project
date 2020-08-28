"use strict";
let doc = document,
	eventClick = "click",
	flag = "false",
	speedHiddenScroll =
		+/\d+\.\d+/.exec(
			window.getComputedStyle(doc.querySelector(".out-popup")).transition
		)[0] * 1000,
	lockElem = doc.querySelector(".fixed"),
	scrollWidth = window.innerWidth - doc.getElementsByTagName("html")[0].clientWidth;

if (
	navigator.userAgent.indexOf("Mobile") !== -1 ||
	navigator.userAgent.indexOf("iPhone") !== -1 ||
	navigator.userAgent.indexOf("Android") !== -1 ||
	navigator.userAgent.indexOf("Windows Phone") !== -1
) {
	eventClick = "touchstart";
}

function constr(arg1, arg2, arg3, arg4, arg5, arg6) {
	let flag2 = arg2;
	if (flag2 === "true") {
		doc.querySelector("div." + arg1).classList.add("view__out"),
			doc
				.querySelector("div." + arg1 + " > .popup-window")
				.classList.add("view__popup");
	} else {
		doc.querySelector("div." + arg1).classList.remove("view__out"),
			doc
				.querySelector("div." + arg1 + " > .popup-window")
				.classList.remove("view__popup");
	}
	setTimeout(() => {
		flag = arg3;
		lockElem.setAttribute("style", "padding-right:" + arg4 + "px");
		doc.body.setAttribute("style", "padding-right:" + arg4 + "px; overflow:" + arg5);
	}, arg6);
}
doc.onkeydown = (e) => {
	let closeEsc = doc.querySelector(".view__out").className.replace(/ .*/, "");
	if (e.which == 27 && closeEsc) {
		constr(closeEsc, "false", "false", 0, "auto", speedHiddenScroll);
	}
};
doc.body.addEventListener(eventClick, (e) => {
	let open = e.target.className.replace(/ .*/, ""),
		close = e.target.parentNode.parentNode.className.replace(/ .*/, ""),
		regex = /(?:Open)/gi;
	if (e.target.tagName.toLowerCase() === "a" && open.match(regex) && flag === "false") {
		e.preventDefault();
		constr(open, "true", "true", scrollWidth, "hidden", 0);
	}
	if (open.match(regex) && flag === "false") {
		constr(open, "true", "true", scrollWidth, "hidden", 0);
	} else if (open.match(regex) && e.target.tagName.toLowerCase() === "div") {
		constr(open, "false", "false", 0, "auto", speedHiddenScroll);
	} else if (e.target.classList.contains("close")) {
		constr(close, "false", "false", 0, "auto", speedHiddenScroll);
	} else if (open.match(regex) && flag === "true") {
		let dooble = e.target.parentNode.parentNode.parentNode.className.replace(/ .*/, ""),
			doobleTarget = e.target.className.replace(/ .*/, "");
		constr(dooble, "false", "true", scrollWidth, "hidden", 0);
		constr(doobleTarget, "true", "true", scrollWidth, "hidden", 0);
	}
});
