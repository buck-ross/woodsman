/**
* @fileoverview Test the functionality of the logging frontend
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


const assert = require("assert");
const sinon = require("sinon");

const woodsman = require("../build/woodsman.cjs.js");

/**
* Provide the test suite for the Logger
*/
describe("The Logger provider", function() {
	/**
	* Ensure that the subject has loaded correctly
	*/
	it("should be an object containing \"getNamespace,\" \"getDefaultLevel,\" \"setDefaultLevel,\" \"log,\" \"info,\" \"warn,\" \"error,\" \"group,\" & \"groupEnd\" functions", function() {
		// Initialize an anonymous subject for inspection:
		var subject = new woodsman.Logger({ loggerConfig: () => {} }, "");

		// Test the values:
		assert.equal(typeof subject, "object", "The subject is not an object");
		assert.equal(typeof subject.getNamespace, "function", "The subject lacks a `getNamespace()` method");
		assert.equal(typeof subject.getDefaultLevel, "function", "The subject lacks a `getDefaultLevel()` method");
		assert.equal(typeof subject.setDefaultLevel, "function", "The subject lacks a `setDefaultLevel()` method");
		assert.equal(typeof subject.log, "function", "The subject lacks a `log()` method");
		assert.equal(typeof subject.info, "function", "The subject lacks a `info()` method");
		assert.equal(typeof subject.warn, "function", "The subject lacks a `warn()` method");
		assert.equal(typeof subject.error, "function", "The subject lacks a `error()` method");
		assert.equal(typeof subject.group, "function", "The subject lacks a `group()` method");
		assert.equal(typeof subject.groupEnd, "function", "The subject lacks a `groupEnd()` method");
	});


	// #############################################
	// #                                           #
	// #    Test the getNamespace functionality    #
	// #                                           #
	// #############################################


	/**
	* Provide testing for the `getNamespace` function
	*/
	describe("getNamespace()", function() {
		/**
		* There's really not much here to test. Just make sure that the name values are the same as the input
		*/
		it("should return the correct namespace values", function() {
			// Initialize the subject:
			var subject = new woodsman.Logger(new woodsman.Manager({}, "PARENT"), "LOGGER");

			// Check the output:
			assert.equal(subject.getNamespace().app, "PARENT", "The subject failed to report the correct application name");
			assert.equal(subject.getNamespace().logger, "LOGGER", "The subject failed to report the correct logger name");
		});
	});


	// ##################################################################
	// #                                                                #
	// #    Test the getDefaultLevel & setDefaultLevel functionality    #
	// #                                                                #
	// ##################################################################


	/**
	* Provide testing for the `getDefaultLevel` & `setDefaultLevel` functions
	*/
	describe("getDefaultLevel() & setDefaultLevel()", function() {
		/**
		* Make sure that the default level has the correct level by default
		*/
		it("should return a default level of `0` if the level has not been set manually", function() {
			// Initialize the subject:
			var subject = new woodsman.Logger({ loggerConfig: () => {} }, "");

			// Check the output:
			assert.equal(subject.getDefaultLevel(), 0, "The subject's default level was non-zero");
		});

		/**
		* Make sure that the default level changes when prompted
		*/
		it("should return the last value it was set to", function() {
			// Initialize the subject:
			var subject = new woodsman.Logger({ loggerConfig: () => {} }, "");

			// Check the output:
			assert.equal(subject.getDefaultLevel(), 0, "The subject's default level was non-zero");
			subject.setDefaultLevel(42);
			assert.equal(subject.getDefaultLevel(), 42, "The subject returned an incorrect default level on the first run");
			subject.setDefaultLevel(2018);
			assert.equal(subject.getDefaultLevel(), 2018, "The subject returned an incorrect default level on the second run");
			subject.setDefaultLevel(4096);
			assert.equal(subject.getDefaultLevel(), 4096, "The subject returned an incorrect default level on the third run");
		});
	});


	// #########################################################
	// #                                                       #
	// #    Test the log, info, warn, & error functionality    #
	// #                                                       #
	// #########################################################


	/**
	* Provide testing for all of the main logging components (the ones replacing "console.log();")
	*/
	describe("log(), info(), warn(), & error()", function() {
		/**
		* Make sure that each function calls "Manager.prototype.push()" with the correct parameters
		*/
		it("should provide the minimized output to `Manager.prototype.push()`", function() {
			// Setup the subject:
			var manager = new woodsman.Manager({
				// Spoof all necessary methods:
				env: {
					timestamp: null,
					tracer: null
				}
			}, "");
			sinon.stub(manager, "push");
			var subject = new woodsman.Logger(manager, "TheSubject");

			// Run test on `log()`:
			subject.log("This is a message");
			assert(manager.push.calledOnceWithExactly({ from: "TheSubject", type: "log", message: "This is a message", level: 0 }), "`log()` called the Manager with the wrong parameters");
			manager.push.reset();

			// Run test on `info()`:
			subject.info("This is a message");
			assert(manager.push.calledOnceWithExactly({ from: "TheSubject", type: "info", message: "This is a message", level: 0 }), "`info()` called the Manager with the wrong parameters");
			manager.push.reset();

			// Run test on `warn()`:
			subject.warn("This is a message");
			assert(manager.push.calledOnceWithExactly({ from: "TheSubject", type: "warn", message: "This is a message", level: 0 }), "`warn()` called the Manager with the wrong parameters");
			manager.push.reset();

			// Run test on `error()`:
			subject.error("This is a message");
			assert(manager.push.calledOnceWithExactly({ from: "TheSubject", type: "error", message: "This is a message", level: 0 }), "`error()` called the Manager with the wrong parameters");
		});

		/**
		* Make sure that each function calls "Manager.prototype.push()" with the correct parameters
		*/
		it("should provide the full output to `Manager.prototype.push()`", function() {
			// Setup the subject:
			var manager = new woodsman.Manager({
				// Spoof all necessary methods:
				env: {
					timestamp: () => { return "<YOUR TIMESTAMP HERE>"; },
					tracer: () => { return "<YOUR STACKTRACE HERE>"; }
				}
			}, "");
			sinon.stub(manager, "push");
			var subject = new woodsman.Logger(manager, "TheSubject");

			// Run test on `log()`:
			subject.log("This is a message");
			assert(manager.push.calledOnceWithExactly({
				from: "TheSubject",
				type: "log",
				message: "This is a message",
				level: 0,
				timestamp: "<YOUR TIMESTAMP HERE>",
				trace: "<YOUR STACKTRACE HERE>"
			}), "`log()` called the Manager with the wrong parameters");
			manager.push.reset();

			// Run test on `info()`:
			subject.info("This is a message");
			assert(manager.push.calledOnceWithExactly({
				from: "TheSubject",
				type: "info",
				message: "This is a message",
				level: 0,
				timestamp: "<YOUR TIMESTAMP HERE>",
				trace: "<YOUR STACKTRACE HERE>"
			}), "`info()` called the Manager with the wrong parameters");
			manager.push.reset();

			// Run test on `warn()`:
			subject.warn("This is a message");
			assert(manager.push.calledOnceWithExactly({
				from: "TheSubject",
				type: "warn",
				message: "This is a message",
				level: 0,
				timestamp: "<YOUR TIMESTAMP HERE>",
				trace: "<YOUR STACKTRACE HERE>"
			}), "`warn()` called the Manager with the wrong parameters");
			manager.push.reset();

			// Run test on `error()`:
			subject.error("This is a message");
			assert(manager.push.calledOnceWithExactly({
				from: "TheSubject",
				type: "error",
				message: "This is a message",
				level: 0,
				timestamp: "<YOUR TIMESTAMP HERE>",
				trace: "<YOUR STACKTRACE HERE>"
			}), "`error()` called the Manager with the wrong parameters");
		});
	});


	// #################################################
	// #                                               #
	// #    Test the group & groupEnd functionality    #
	// #                                               #
	// #################################################


	describe("group() & groupEnd()", function() {
		/**
		* Ensure "group()" forewards all of its parameters to the Manager
		*/
		it("should forward all `group()` parameters directly to the Manager", function() {
			// Setup the subject:
			var manager = new woodsman.Manager({}, "");
			sinon.stub(manager, "group");
			var subject = new woodsman.Logger(manager, "TheSubject");

			// Run the test:
			subject.group("Group Name");

			// Check the output:
			assert(manager.group.calledOnceWithExactly("TheSubject", "Group Name"), "The Manager was not called exactly once with the correct parameters");
		});

		/**
		* Ensure "groupEnd()" forewards all of its parameters to the Manager
		*/
		it("should forward all `groupEnd()` calls directly to the Manager", function() {
			// Setup the subject:
			var manager = new woodsman.Manager({}, "");
			sinon.stub(manager, "groupEnd");
			var subject = new woodsman.Logger(manager, "TheSubject");

			// Run the test:
			subject.groupEnd();

			// Check the output:
			assert(manager.groupEnd.calledOnceWithExactly("TheSubject"), "The Manager was not called exactly once with the correct parameters");
		});
	});
});

// ex: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

