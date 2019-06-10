/*
* @fileoverview Implement Woodsman's Manager class
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
* Define the default method for derriving a stacktrace from an Error object. Always starts 2 levels below the calling method.
* @return {string} The resulting trace as a list of functions, seperated by newlines.
*/
var defaultStacktrace = function() {
	// Generate the trace:
	return new Error().stack
		// Trim the fat:
		.replace(/\n\s\s\s\sat\s/g, "\n").replace(/\n(err)?<?@/g, "\n").replace(/^Error\n/, "").replace(/\n$/, "")
		// Cut off extra layers & stitch back together:
		.split("\n").splice(2).join("\n");
};

/**
* Create a Managemer
* @memberof woodsman
* @implements {ManagerAPI}
* @constructor
* @param {ManagerConfig} config This parameter must contain the Manager's configuration object.
* @param {string} appName The name of the application to be managed.
*/
export default function Manager(config, appName) {
	// Store the name of the application:
	this.name = appName;

	// Register the scheduler method:
	if (config.env && typeof config.env.scheduler === "function")
		this.scheduler = config.env.scheduler;
	else
		this.scheduler = (cb) => { setTimeout(cb, 0); };
	// Register the timestamp method:
	if (config.env && typeof config.env.timestamp !== "undefined")
		this.date = config.env.timestamp;
	else
		this.date = () => { return new Date().toISOString(); };
	// Register the timer method:
	if (config.env && typeof config.env.timer !== "undefined")
		this.timer = config.env.timer;
	else
		this.timer = Date.now;
	// Register the stacktrace method:
	if (config.env && typeof config.env.tracer !== "undefined")
		this.tracer = config.env.tracer;
	else if (typeof Error === "function" && typeof new Error().stack === "string")
		this.tracer = defaultStacktrace;

	// Setup the Backends:
	this.backends = [];
	if (config.backends)
		for (let key in config.backends) if (Object.prototype.hasOwnProperty.call(config.backends, key))
			this.backends.push({
				name: key,
				handle: config.backends[key]
			});

	// Setup the messaging queues:
	this.processing = false;
	this.queue = [];
	this.groups = {};
}

/**
* Execute the actual process of formatting the logging content & transfering it to the backends
*/
var process = function() {
	// Preserve the "this" reference for scheduled functions:
	// eslint-disable-next-line no-invalid-this
	var that = this;

	// Declare the current processing state:
	that.processing = true;

	// Setup the state variables:
	var queueIndex = -1,
		groupIndex = 0,
		backendsIndex = 0,
		tmpEntry;

	// Forwared declare both the processor and the pusher:
	var processor, pusher;

	/**
	* Take the current entry from the queue, restructure it as a `BackendEntry`, and store it in `tmpEntry`
	*/
	processor = () => {
		// Increment the coutner (if appropriate) & check for the end:
		if (groupIndex === 0 && ++queueIndex === that.queue.length) {
			// Reset the environment:
			that.queue = [];
			that.processing = false;
			return;
		}

		// Deal with group entries:
		if (typeof that.queue[queueIndex].group === "object") {
			// Deal with group elements:
			if (typeof that.queue[queueIndex].group[groupIndex].group === "string")
				tmpEntry = { group: that.queue[queueIndex].group[groupIndex].group };

			// Deal with groupEnd elements:
			else if (that.queue[queueIndex].group[groupIndex].groupEnd)
				tmpEntry = { groupEnd: true };

			// Deal with all other internal elements:
			else {
				tmpEntry = that.queue[queueIndex].group[groupIndex];
				tmpEntry.app = that.name;
			}

			// Change the Group Index:
			if (++groupIndex === that.queue[queueIndex].group.length)
				groupIndex = 0;

		// Deal with individual entries:
		} else {
			tmpEntry = that.queue[queueIndex];
			tmpEntry.app = that.name;
		}

		// Schedule the pusher:
		that.scheduler(pusher);
	};

	/**
	* Once the entry has been processed, recursively push it to each of the backends
	*/
	pusher = () => {
		// Define the callback:
		var callback = () => {
			// Setup the next call:
			if (++backendsIndex < that.backends.length) {
				that.scheduler(pusher);
				return;
			}
			backendsIndex = 0;
			that.scheduler(processor);
		};

		// Handle groups:
		if (typeof tmpEntry.group === "string")
			that.backends[backendsIndex].handle.group(tmpEntry.group, callback);

		// Handle group endings:
		else if (tmpEntry.groupEnd)
			that.backends[backendsIndex].handle.groupEnd(callback);

		// Handle individual entries:
		else
			that.backends[backendsIndex].handle.push(tmpEntry, callback);
	};

	// Begin the processing cycle by scheduling the processor:
	that.scheduler(processor);
};

/**
* Retrieve the name of the application managed by the current Manager instance.
* @override
* @return {string} The retrieved name string.
*/
Manager.prototype.getName = function() {
	return this.name;
};

/**
* Allow the logger to push `ManagerEntry` objects to the Manager
* @override
* @param {!ManagerEntry} entry The content of the logging entry
*/
Manager.prototype.push = function(entry) {
	// Push the message to the appropriate queue:
	if (typeof this.groups[entry.logger] === "undefined") {
		this.queue.push(entry);

		// If the queue is not currently being processed, trigger the processing system:
		if (!this.processing)
			process.call(this);
	} else
		this.groups[entry.logger].group.push(entry);
};

/**
* Allow the logger to push a new grouping to it's group-stack
* @override
* @param {!string} from The name of the calling logger
* @param {(undefined|string)} name The name of the new group entry
*/
Manager.prototype.group = function(from, name = "") {
	// If no group exists, create one:
	if (typeof this.groups[from] !== "object")
		this.groups[from] = { name: name, group: [], depth: 0 };

	// Push a group entry && increment the depth:
	this.groups[from].group.push({ group: name });
	this.groups[from].depth++;
};

/**
* Allow the logger to pop an existing grouping from it's group-stack
* @override
* @param {!string} from The name of the calling logger
*/
Manager.prototype.groupEnd = function(from) {
	// Decrement the depth & push a "groupEnd" entry:
	this.groups[from].group.push({ groupEnd: true });
	this.groups[from].depth--;

	// If the depth is zero, push the group to the main queue:
	if (this.groups[from].depth === 0) {
		this.queue.push(this.groups[from]);
		delete this.groups[from];

		// If the queue is not currently being processed, trigger the processing system:
		if (!this.processing)
			process.call(this);
	}
};

/**
* Generate a `LoggerConfig` object for the provided `Logger`
* @override
* @return {LoggerConfig} The corresponding config object for the specified `Logger`
*/
Manager.prototype.loggerConfig = function() {
	var out = {
		env: {
			timestamp: this.date,
			timer: this.timer,
			tracer: this.tracer
		}
	};
	return out;
};

// ex: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

