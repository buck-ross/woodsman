/*
* @fileoverview Implement Woodsman's Logger class
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
* Create a console-like method for interfacing with the Logger objects
* @param {string} type The type of logging entries which the method will handle
* @return {function(this:Logger, !string, number=)} The method which will handle all forwarded logging calls
*/
var loggerFactory = function(type) {
	/**
	* Commit a String to the logging system as a basic log entry.
	* @this Logger
	* @param {!string} message The parameter to be committed.
	* @param {number} [level] The logging level of the message.
	*/
	var out = function(message, level) {
		// If "level" is not set, use the default:
		if (!level) level = this.defaultLevel;
		// Send the actual message:
		var entry = {
			from: this.loggerName,
			message: message,
			level: level,
			type: type
		};
		if (this.config.env.timestamp)
			entry.timestamp = this.config.env.timestamp();
		if (this.config.env.tracer)
			entry.trace = this.config.env.tracer();
		// Push the data:
		this.manager.push(entry);
	};
	return out;
};

/**
* Create a Logger
* @memberof woodsman
* @implements {LoggerAPI}
* @constructor
* @param {ManagerAPI} parent A handle to the logger's parent manager object
* @param {string} name The name of this particular logger object; this will become the second part of the logger's namespace
*/
export default function Logger(parent, name) {
	// Begin declaring the internal variables:
	this.manager = parent;
	this.config = parent.loggerConfig();
	this.loggerName = name;
	this.defaultLevel = 0;
}

/**
* Get the namespace of the current logger object
* @override
* @return {{app: string, logger: string}} An object representing the full namespace in two parts: the "app" name, and the "logger" name
*/
Logger.prototype.getNamespace = function() {
	return {
		app: this.manager.getName(),
		logger: this.loggerName
	};
};

/**
* Get the default logging-level of the current logger instance.
* If it has not been otherwise specified by calling `setDefaultLevel` the default level should be `0`.
* @override
* @return {!number} The default logging level.
*/
Logger.prototype.getDefaultLevel = function() {
	return this.defaultLevel;
};

/**
* Set the default logging-level of the current logger instance.
* @override
* @param {!number} level The new default level of the logger object
*/
Logger.prototype.setDefaultLevel = function(level) {
	this.defaultLevel = level;
};

/**
* Commit an Object or String to the logging system as a basic log entry.
* @override
* @param {!string} message The parameter to be committed.
* @param {number} [level] The logging level of the message.
*/
Logger.prototype.log = loggerFactory("log");

/**
* Commit an Object or String to the logging system as an informational entry.
* @override
* @param {!string} message The parameter to be committed.
* @param {number} [level] The logging level of the message.
*/
Logger.prototype.info = loggerFactory("info");

/**
* Commit an Object or String to the logging system as a warning entry.
* @override
* @param {!string} message The parameter to be committed.
* @param {(undefined|number)} [level] The logging level of the message.
*/
Logger.prototype.warn = loggerFactory("warn");

/**
* Commit an Object or String to the logging system as an error entry.
* @override
* @param {!string} message The parameter to be committed.
* @param {(undefined|number)} [level] The logging level of the message.
*/
Logger.prototype.error = loggerFactory("error");

/**
* Tell the manager to group all subsequent messages together until "groupEnd" is called when the created group is on top of the group-stack.
* @override
* @param {(undefined|string)} [groupName] The name of the group to create.
*/
Logger.prototype.group = function(groupName) {
	this.manager.group(this.loggerName, groupName);
};

/**
* End the group on the top of the group stack & flush its contents to the manager.
* @override
*/
Logger.prototype.groupEnd = function() {
	this.manager.groupEnd(this.loggerName);
};

// ex: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

