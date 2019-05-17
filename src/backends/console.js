// ##########################################
// #																				#
// #		Define the `ConsoleBackend` class		#
// #																				#
// ##########################################
"use strict";


/**
* Create a Console
* @memberof woodsman
* @implements {BackendAPI}
* @constructor
* @param {(undefined|{log: function(...?), info: (undefined|function(...?)), warn: (undefined|function(...?)), error: (undefined|function(...?)), group: (undefined|function(...?)), groupEnd: (undefined|function())})} consoleIn The native "console" object to which to bind the backend
*/
export default function Console(consoleIn) {
	// Set the console:
	if (typeof consoleIn !== "object" || typeof consoleIn.log !== "function")
		consoleIn = console;

	// Set local methods based on console content:
	this["log"] = consoleIn.log;
	if (typeof consoleIn.info === "function")
		this["info"] = consoleIn.info;
	else
		this["info"] = consoleIn.log;
	if (typeof consoleIn.warn === "function")
		this["warn"] = consoleIn.warn;
	else
		this["warn"] = consoleIn.log;
	if (typeof consoleIn.error === "function")
		this["error"] = consoleIn.error;
	else
		this["error"] = consoleIn.log;
	if (typeof consoleIn.group === "function" && typeof consoleIn.groupEnd === "function") {
		this.groupLocal = consoleIn.group;
		this.groupEndLocal = consoleIn.groupEnd;
	} else {
		this.groupLocal = (name) => { consoleIn.log("---------- BEGIN GROUP \"" + name + "\" ----------"); };
		this.groupEndLocal = () => { consoleIn.log("---------- END GROUP ----------"); };
	}
};

/**
* Push the provided entry or group of entries to the backend.
* @override
* @param {!BackendEntry} input The data to be pushed to the backend.
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*  However, this callback function must always be called once the pushing process has completed.
*/
Console.prototype.push = function(input, callback) {
	// Assemble the message to print to the console:
	var message = "[" + input.app + ":" + input.logger + "@" + input.level + "]";
	if (input.timestamp)
		message += " " + input.timestamp;
	message += ": " + input.message;
	if (input.trace)
		message += "\n" + input.trace;

	// Print the message to the console:
	this[input["type"]](message);
	callback();
};

/**
* Cause the backend to treat all subsequent entries as members of a group with the specified name.
* @override
* @param {!string} name The name of the group.
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*/
Console.prototype.group = function(name, callback) {
	this.groupLocal(name);
	callback();
};

/**
* Terminate the newest active group within the logging system
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
* @override
*/
Console.prototype.groupEnd = function(callback) {
	this.groupEndLocal();
	callback();
};

// ex: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

