/*
* @fileoverview Define a backend to harness node's filesystem API to generate log files
* @author Haximilian <haximilian@gmail.com>
* @module woodsman
* Copyright (C) 2019 Haximilian
* This file is part of Woodsman.
*
* Woodsman is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published
* by the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Woodsman is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with Woodsman. If not, see <https://www.gnu.org/licenses/>.
*/


/**
* Create a NodeFile backend.
* @memberof woodsman
* @implements {BackendAPI}
* @constructor
* @param {(undefined|{file: (undefined|string), shim: (undefined|{fs:(undefined|{appendFile: function(number, string, function(): ?): ?})})})} config The file configuration object.
*/
export default function NodeFile(config) {
	// Configure the shim:
	if (typeof config === "undefined")
		config = {};
	if (typeof config.shim === "object" && typeof config.shim.fs === "object")
		this.fs = config.shim.fs;
	else if (typeof require === "function")
		// eslint-disable-next-line no-undef
		this.fs = require("fs");
	else
		throw new Error("unable to acquire a handle to the local filesystem");

	// Set the file handle:
	if (typeof config.file === "string")
		this.file = config.file;
	else
		this.file = "woodsman.txt";

	// Set an internal variable to monitor the grouping depth:
	this.groups = 0;
}

/**
* Push the provided entry or group of entries to the backend.
* @override
* @param {!BackendEntry} input The data to be pushed to the backend.
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*  However, this callback function must always be called once the pushing process has completed.
*/
NodeFile.prototype.push = function(input, callback) {
	var message = "";

	// Account for the grouping depth:
	for (let index = 0; index < this.groups; ++index)
		message += "| ";

	// Assemble the message:
	message += "[" + input.app + ":" + input.logger + "@" + input.type + ":" + input.level + "]";
	if (input.timestamp)
		message += " " + input.timestamp;
	if (input.message)
		message += ": " + input.message;
	if (input.trace)
		message += "\n" + input.trace;
	message += "\n";

	// Write the message out to the file:
	this.fs["appendFile"](this.file, message, callback);
};

/**
* Cause the backend to treat all subsequent entries as members of a group with the specified name.
* @override
* @param {!string} name The name of the group.
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*/
NodeFile.prototype.group = function(name, callback) {
	var message = "";

	// Account for the grouping depth:
	for (let index = 0; index < this.groups; ++index)
		message += "| ";

	// Write the grouping to the file:
	this.fs["appendFile"](this.file, message + "GROUP (" + name + ")", callback);
	++this.groups;
};

/**
* Terminate the newest active group within the logging system
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
* @override
*/
NodeFile.prototype.groupEnd = function(callback) {
	--this.groups;
	callback();
};

// ex: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

