// Import all dependencies:
import Manager from "../manager.js";
import Logger from "../logger.js";
import Console from "../backends/console.js";

// All properties names must be strings in order to preserve their names during the compilaion process
// 
module.exports = {
	"Manager": Manager,
	"Logger": Logger,
	"backends": {
		"Console": Console
	}
};

// eslint-disable-next-line capitalize-comments
// vim: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

