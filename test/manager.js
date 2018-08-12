/**
* @fileoverview Test the functionality of the managment system for logging backends
* @author Haximilian <haximilian@gmail.com>
* @license AGPL-3.0 (See the included "LICENSE.md")
* @copyright
* Copyright (C) 2018 Haximilian
* This file is part of the program Woodsman.
*
* Woodsman is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* Woodsman is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
"use strict";

const req = require("requirejs");
const assert = require("assert");
const sinon = require("sinon");

// Configure the dependency loader:
req.config({
  baseUrl: "build",
  paths: {
    "woodsman": "woodsman.min"
  }
});

/**
* Provide the test suite for the Manager
*/
describe("The Manager provider", function() {
  var Manager;

  /**
  * Before anything else, load the woodsman library and initialize the test subject
  * @return {Promise} the asynchronous function which initializes the test
  */
  before(function() {
    return new Promise((resolve, reject) => {
      req([ "woodsman" ], (dependency) => {
        // Store the `Manager` constructor in the local `Manager` variable:
        Manager = dependency.Manager;
        resolve();
      }, (err) => {
        reject(err);
      });
    });
  });

  /**
  * Ensure that the subject has loaded correctly
  */
  it("should be an object containing \"getName,\" \"push,\" \"group,\" \"groupEnd,\" and \"loggerConfig\" functions", function() {
    // Initialize an anonymous subject for inspection:
    var subject = new Manager({});

    // Test the values:
    assert.equal(typeof subject, "object", "The subject is not an object");
    assert.equal(typeof subject.getName, "function", "The subject lacks a `getName()` method");
    assert.equal(typeof subject.push, "function", "The subject lacks a `push()` method");
    assert.equal(typeof subject.group, "function", "The subject lacks a `group()` method");
    assert.equal(typeof subject.groupEnd, "function", "The subject lacks a `groupEnd()` method");
    assert.equal(typeof subject.loggerConfig, "function", "The subject lacks a `loggerConfig()` method");
  });


  // ########################################
  // #                                      #
  // #    Test the getName functionality    #
  // #                                      #
  // ########################################


  /**
  * Provide testing for the `getName` function
  */
  describe("getName()", function() {
    /**
    * There's really not much here to test. Just make sure that the name value is the same as the input
    */
    it("should return the correct name value", function() {
      // Initialize the subject:
      var subject = new Manager({}, "ThisIsATestSubject");

      // Check the output:
      assert.equal(subject.getName(), "ThisIsATestSubject", "The subject failed to report the correct name");
    });
  });


  // ####################################
  // #                                  #
  // #    Test the push functionality   #
  // #                                  #
  // ####################################


  /**
  * Provide testing for the `push` function
  */
  describe("push()", function() {
    /**
    * Test the functionality when provided with a synchronous scheduler
    */
    describe("running with a synchronous scheduling shim", function() {
      /**
      * Ensure that the push function works properly when given a single entry
      */
      it("should work properly when given a single entry & a single backend", function() {
        // Spoof the Backends:
        var backend = { push: () => {} };
        var results = [];
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 10, timestamp: "This is a timestamp", trace: "This is a trace"
        });

        // Test the output:
        assert.equal(results.length, 1, "The Backend was not called exactly once");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 10, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input");
      });

      /**
      * Ensure that the push function works properly when given ten entries
      */
      it("should work properly when given ten entries & a single backend", function() {
        // Spoof the Backends:
        var backend = { push: () => {} };
        var results = [];
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER4", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.push({
          from: "LOGGER5", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.push({
          from: "LOGGER6", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER7", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.push({
          from: "LOGGER8", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER9", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        subject.push({
          from: "LOGGER0", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });

        // Test the output:
        assert.equal(results.length, 10, "The Backend was not called exactly ten times");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[2], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER4" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER5" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER6" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[6], {
          origin: { app: "APP", logger: "LOGGER7" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER8" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER9" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER0" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
      });

      /**
      * Ensure that the push function works properly when given four entries and ten backends
      */
      it("should work properly when given four entries & ten backends", function() {
        // Spoof the Backends:
        var backends = {};
        var results = [];
        for (let count = 0; count < 10; count++) {
          backends["console" + count] = { push: () => {} };
          results[count] = [];
          sinon.stub(backends["console" + count], "push").callsFake((input, cb) => {
            results[count].push(input);
            cb();
          });
        }

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: backends
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER4", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });

        // Test the output:
        for (let count = 0; count < 10; count++) {
          assert.equal(results[count].length, 4, "Backend #" + count + " was not called exactly six times");
          assert.deepEqual(results[count][0], {
            origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
          }, "The caller failed to provide the correct input for the first call on backend #" + count);
          assert.deepEqual(results[count][1], {
            origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
          }, "The caller failed to provide the correct input for the second call on backend #" + count);
          assert.deepEqual(results[count][2], {
            origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
          }, "The caller failed to provide the correct input for the third call on backend #" + count);
          assert.deepEqual(results[count][3], {
            origin: { app: "APP", logger: "LOGGER4" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
          }, "The caller failed to provide the correct input for the fourth call on backend #" + count);
        }
      });
    });

    /**
    * Test the functionality when provided with an asynchronous scheduling shim
    */
    describe("running with an asynchronous scheduling shim", function() {
      /**
      * Start off with a simple test of a single entry
      */
      it("should work properly when given a single entry & a single backend", function() {
        // Spoof the Backends:
        var backend = { push: () => {} };
        var results = [];
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 10, timestamp: "This is a timestamp", trace: "This is a trace"
        });

        // Make sure that nothing has happened yet:
        assert.equal(results.length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Test the output:
        assert.equal(results.length, 1, "The Backend was not called exactly once");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 10, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input");
      });

      /**
      * Ensure that the push function continues to work properly when given ten entries
      */
      it("should work properly when given ten entries & a single backend", function() {
        // Spoof the Backends:
        var backend = { push: () => {} };
        var results = [];
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER4", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.push({
          from: "LOGGER5", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.push({
          from: "LOGGER6", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER7", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.push({
          from: "LOGGER8", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER9", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        subject.push({
          from: "LOGGER0", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });

        // Make sure that nothing has happened yet:
        assert.equal(results.length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Test the output:
        assert.equal(results.length, 10, "The Backend was not called exactly ten times");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[2], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER4" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER5" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER6" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[6], {
          origin: { app: "APP", logger: "LOGGER7" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER8" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER9" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER0" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
      });

      /**
      * Ensure that the test with 10 entries still works when the calls are intermixed with calls to the eventLoop
      */
      it("should work properly when given ten entries & a single backend, when eventLoop calls are intermixed with \"push\" calls", function() {
        // Spoof the Backends:
        var backend = { push: () => {} };
        var results = [];
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        eventLoop.shift()();
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        eventLoop.shift()();
        eventLoop.shift()();
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER4", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        eventLoop.shift()();
        subject.push({
          from: "LOGGER5", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        eventLoop.shift()();
        eventLoop.shift()();
        eventLoop.shift()();
        subject.push({
          from: "LOGGER6", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER7", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        eventLoop.shift()();
        subject.push({
          from: "LOGGER8", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER9", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        eventLoop.shift()();
        eventLoop.shift()();
        subject.push({
          from: "LOGGER0", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Test the output:
        assert.equal(results.length, 10, "The Backend was not called exactly ten times");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[2], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER4" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER5" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER6" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[6], {
          origin: { app: "APP", logger: "LOGGER7" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER8" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER9" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER0" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
      });

      /**
      * Ensure that the push function continues to work properly when given four entries and ten backends
      */
      it("should work properly when given four entries & ten backends", function() {
        // Spoof the Backends:
        var backends = {};
        var results = [];
        for (let count = 0; count < 10; count++) {
          backends["console" + count] = { push: () => {} };
          results[count] = [];
          sinon.stub(backends["console" + count], "push").callsFake((input, cb) => {
            results[count].push(input);
            cb();
          });
        }

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: backends
        }, "APP");

        // Run the test:
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER4", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });

        // Make sure that nothing has happened yet:
        assert.equal(results.length, 10, "The results array was the wrong size. This is probably a problem with the test.");
        for (let count = 0; count < 10; count++)
          assert.equal(results[count].length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Test the output:
        for (let count = 0; count < 10; count++) {
          assert.equal(results[count].length, 4, "Backend #" + count + " was not called exactly four times");
          assert.deepEqual(results[count][0], {
            origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
          }, "The caller failed to provide the correct input for the first call on backend #" + count);
          assert.deepEqual(results[count][1], {
            origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
          }, "The caller failed to provide the correct input for the second call on backend #" + count);
          assert.deepEqual(results[count][2], {
            origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
          }, "The caller failed to provide the correct input for the third call on backend #" + count);
          assert.deepEqual(results[count][3], {
            origin: { app: "APP", logger: "LOGGER4" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
          }, "The caller failed to provide the correct input for the fourth call on backend #" + count);
        }
      });
    });
  });


  // ################################################
  // #                                              #
  // #    Test the group & groupEnd functionality   #
  // #                                              #
  // ################################################


  /**
  * Provide testing for the `group` & `groupEnd` functions
  */
  describe("group() & groupEnd()", function() {
    /**
    * Test the functionality when provided with a synchronous scheduler
    */
    describe("running with a synchronous scheduling shim", function() {
      /**
      * Get things started off with a simple empty group
      */
      it("should send an empty group", function() {
        // Spoof the Backends:
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          cb();
        });

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "group name");

        // Break point:
        assert(backend.group.notCalled, "The \"group()\" method was called on the backend before it was supposed to be");
        assert(backend.groupEnd.notCalled, "The \"groupEnd()\" method was called on the backend before it was supposed to be");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Check the results:
        assert(backend.push.notCalled, "The \"push()\" method was called on the backend");
        assert(backend.group.calledOnce, "The \"group\" method on the backend was not called exactly once");
        assert.equal(backend.group.firstCall.args.length, 2, "The \"group\" method on the backend was not called with exactly 2 arguments");
        assert.equal(backend.group.firstCall.args[0], "group name", "The \"group\" method on the backend was not called with the correct name");
        assert(backend.groupEnd.calledOnce, "The \"groupEnd\" method on the backend was not called exactly once");
        assert(backend.group.calledBefore(backend.groupEnd), "The \"group\" method was not called before the \"groupEnd\" method");
      });

      /**
      * Try grouping ten logging calls together synchronously
      */
      it("should send a group of ten calls", function() {
        // Spoof the Backends:
        var results = [];
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          results.push({ group: name });
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          results.push({ groupEnd: true });
          cb();
        });

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "myGroup");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });

        // Break point:
        assert.equal(results.length, 0, "Something was pushed before it was supposed to be");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Check the results:
        assert.equal(results.length, 12, "There were not exactly 12 calls made by the subject to the backend");
        assert.deepEqual(results[0], { group: "myGroup" }, "The group was not decalred first or was declared incorrectly");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[2], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[6], {
          origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[10], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
        assert.deepEqual(results[11], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
      });

      /**
      * Ensure that the grouping operators work properly when given a four entry group and ten backends
      */
      it("should work properly when given four entries & ten backends", function() {
        // Spoof the Backends:
        var backends = {};
        var results = [];
        for (let count = 0; count < 10; count++) {
          backends["console" + count] = { group: () => {}, push: () => {}, groupEnd: () => {} };
          results[count] = [];
          sinon.stub(backends["console" + count], "push").callsFake((input, cb) => {
            results[count].push(input);
            cb();
          });
          sinon.stub(backends["console" + count], "group").callsFake((name, cb) => {
            results[count].push({ group: name });
            cb();
          });
          sinon.stub(backends["console" + count], "groupEnd").callsFake((cb) => {
            results[count].push({ groupEnd: true });
            cb();
          });
        }

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: backends
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "testGroup");
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });

        // Break point:
        for (let index = 0; index < 10; index++)
          assert.equal(results[index].length, 0, "Something was pushed to backend #" + index + " before it was supposed to be");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Test the output:
        for (let count = 0; count < 10; count++) {
          assert.equal(results[count].length, 6, "Backend #" + count + " was not called exactly six times");
          assert.deepEqual(results[count][0], { group: "testGroup" }, "The group was not decalred first or was declared incorrectly for backend #" + count);
          assert.deepEqual(results[count][1], {
            origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
          }, "The caller failed to provide the correct input for the first call on backend #" + count);
          assert.deepEqual(results[count][2], {
            origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
          }, "The caller failed to provide the correct input for the second call on backend #" + count);
          assert.deepEqual(results[count][3], {
            origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
          }, "The caller failed to provide the correct input for the third call on backend #" + count);
          assert.deepEqual(results[count][4], {
            origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
          }, "The caller failed to provide the correct input for the fourth call on backend #" + count);
          assert.deepEqual(results[count][5], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of backend #" + count);
        }
      });

      /**
      * Try giving the grouping operators five nested groups
      */
      it("should preserve logical order when provided with five nested groups", function() {
        // Spoof the Backends:
        var results = [];
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          results.push({ group: name });
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          results.push({ groupEnd: true });
          cb();
        });

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "group1");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.group("LOGGER", "group2");
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.group("LOGGER", "group3");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.group("LOGGER", "group4");
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.group("LOGGER", "group5");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });

        // Break point:
        assert.equal(results.length, 0, "Something was pushed before it was supposed to be");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Check the results:
        assert.equal(results.length, 19, "There were not exactly 12 calls made by the subject to the backend");
        assert.deepEqual(results[0], { group: "group1" }, "group1 was not decalred or was declared incorrectly");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[2], { group: "group2" }, "group2 was not decalred or was declared incorrectly");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[4], { group: "group3" }, "group3 was not decalred or was declared incorrectly");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[6], { group: "group4" }, "group4 was not decalred or was declared incorrectly");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[8], { group: "group5" }, "group5 was not decalred or was declared incorrectly");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[10], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group5");
        assert.deepEqual(results[11], {
          origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[12], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group4");
        assert.deepEqual(results[13], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[14], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group3");
        assert.deepEqual(results[15], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[16], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group2");
        assert.deepEqual(results[17], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[18], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group1");
      });

      /**
      * Make sure that the groupings only affect the specified logger
      */
      it("should treat each grouped or ungrouped logger seperately", function() {
        // Spoof the Backends:
        var results = [];
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          results.push({ group: name });
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          results.push({ groupEnd: true });
          cb();
        });

        // Setup the Manager:
        var subject = new Manager({
          env: { scheduler: function(cb) { cb(); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "myGroup");
        subject.push({
          from: "LOGGER2", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.group("LOGGER3", "myGroup");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER3", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.push({
          from: "LOGGER2", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.group("LOGGER2", "otherGroup");
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER2", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.groupEnd("LOGGER3");
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });
        subject.groupEnd("LOGGER2");

        // Check the results:
        assert.equal(results.length, 16, "There were not exactly 16 calls made by the subject to the backend");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[2], { group: "myGroup" }, "The LOGGER group was not decalred or was declared incorrectly");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[5], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
        assert.deepEqual(results[6], { group: "myGroup" }, "The LOGGER3 group was not decalred first or was declared incorrectly");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[9], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
        assert.deepEqual(results[10], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[11], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[12], { group: "otherGroup" }, "The LOGGER2 group was not decalred first or was declared incorrectly");
        assert.deepEqual(results[13], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[14], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
        assert.deepEqual(results[15], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
      });
    });

    /**
    * Test the functionality when provided with an asynchronous scheduler
    */
    describe("running with an asynchronous scheduling shim", function() {
      /**
      * Get things started off with a simple empty group
      */
      it("should send an empty group", function() {
        // Spoof the Backends:
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "group name");

        // Break point:
        assert(backend.group.notCalled, "The \"group()\" method was called on the backend before it was supposed to be");
        assert(backend.groupEnd.notCalled, "The \"groupEnd()\" method was called on the backend before it was supposed to be");
        assert.equal(eventLoop.length, 0, "One or more callbacks were pushed to the loop before the process was meant to execute");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Check the results:
        assert(backend.push.notCalled, "The \"push()\" method was called on the backend");
        assert(backend.group.calledOnce, "The \"group\" method on the backend was not called exactly once");
        assert.equal(backend.group.firstCall.args.length, 2, "The \"group\" method on the backend was not called with exactly 2 arguments");
        assert.equal(backend.group.firstCall.args[0], "group name", "The \"group\" method on the backend was not called with the correct name");
        assert(backend.groupEnd.calledOnce, "The \"groupEnd\" method on the backend was not called exactly once");
        assert(backend.group.calledBefore(backend.groupEnd), "The \"group\" method was not called before the \"groupEnd\" method");
      });

      /**
      * Try grouping ten logging calls together asynchronously
      */
      it("should send a group of ten calls", function() {
        // Spoof the Backends:
        var results = [];
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          results.push({ group: name });
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          results.push({ groupEnd: true });
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "myGroup");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });

        // Break point:
        assert.equal(results.length, 0, "Something was pushed before it was supposed to be");
        assert.equal(eventLoop.length, 0, "One or more callbacks were pushed to the loop before the process was meant to execute");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Make sure that nothing has happened yet:
        assert.equal(results.length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Check the results:
        assert.equal(results.length, 12, "There were not exactly 12 calls made by the subject to the backend");
        assert.deepEqual(results[0], { group: "myGroup" }, "The group was not decalred first or was declared incorrectly");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[2], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[6], {
          origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[10], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
        assert.deepEqual(results[11], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
      });

      /**
      * Ensure that the grouping operators work properly when given a four entry group and ten backends
      */
      it("should work properly when given four entries & ten backends", function() {
        // Spoof the Backends:
        var backends = {};
        var results = [];
        for (let count = 0; count < 10; count++) {
          backends["console" + count] = { group: () => {}, push: () => {}, groupEnd: () => {} };
          results[count] = [];
          sinon.stub(backends["console" + count], "push").callsFake((input, cb) => {
            results[count].push(input);
            cb();
          });
          sinon.stub(backends["console" + count], "group").callsFake((name, cb) => {
            results[count].push({ group: name });
            cb();
          });
          sinon.stub(backends["console" + count], "groupEnd").callsFake((cb) => {
            results[count].push({ groupEnd: true });
            cb();
          });
        }

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: backends
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "testGroup");
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });

        // Break point:
        for (let index = 0; index < 10; index++)
          assert.equal(results[index].length, 0, "Something was pushed to backend #" + index + " before it was supposed to be");
        assert.equal(eventLoop.length, 0, "One or more callbacks were pushed to the loop before the process was meant to execute");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Make sure that nothing has happened yet:
        for (let index = 0; index < 10; index++)
          assert.equal(results[index].length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Test the output:
        for (let count = 0; count < 10; count++) {
          assert.equal(results[count].length, 6, "Backend #" + count + " was not called exactly six times");
          assert.deepEqual(results[count][0], { group: "testGroup" }, "The group was not decalred first or was declared incorrectly for backend #" + count);
          assert.deepEqual(results[count][1], {
            origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
          }, "The caller failed to provide the correct input for the first call on backend #" + count);
          assert.deepEqual(results[count][2], {
            origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
          }, "The caller failed to provide the correct input for the second call on backend #" + count);
          assert.deepEqual(results[count][3], {
            origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
          }, "The caller failed to provide the correct input for the third call on backend #" + count);
          assert.deepEqual(results[count][4], {
            origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
          }, "The caller failed to provide the correct input for the fourth call on backend #" + count);
          assert.deepEqual(results[count][5], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of backend #" + count);
        }
      });

      /**
      * Try giving the grouping operators five nested groups
      */
      it("should preserve logical order when provided with five nested groups", function() {
        // Spoof the Backends:
        var results = [];
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          results.push({ group: name });
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          results.push({ groupEnd: true });
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "group1");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.group("LOGGER", "group2");
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.group("LOGGER", "group3");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.group("LOGGER", "group4");
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.group("LOGGER", "group5");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });

        // Break point:
        assert.equal(results.length, 0, "Something was pushed before it was supposed to be");
        assert.equal(eventLoop.length, 0, "One or more callbacks were pushed to the loop before the process was meant to execute");

        // Finish testing:
        subject.groupEnd("LOGGER");

        // Make sure that nothing has happened yet:
        assert.equal(results.length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Check the results:
        assert.equal(results.length, 19, "There were not exactly 12 calls made by the subject to the backend");
        assert.deepEqual(results[0], { group: "group1" }, "group1 was not decalred or was declared incorrectly");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[2], { group: "group2" }, "group2 was not decalred or was declared incorrectly");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[4], { group: "group3" }, "group3 was not decalred or was declared incorrectly");
        assert.deepEqual(results[5], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[6], { group: "group4" }, "group4 was not decalred or was declared incorrectly");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[8], { group: "group5" }, "group5 was not decalred or was declared incorrectly");
        assert.deepEqual(results[9], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[10], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group5");
        assert.deepEqual(results[11], {
          origin: { app: "APP", logger: "LOGGER" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[12], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group4");
        assert.deepEqual(results[13], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[14], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group3");
        assert.deepEqual(results[15], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[16], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group2");
        assert.deepEqual(results[17], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[18], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end of group1");
      });

      /**
      * Make sure that the groupings only affect the specified logger
      */
      it("should treat each grouped or ungrouped logger seperately", function() {
        // Spoof the Backends:
        var results = [];
        var backend = { group: () => {}, push: () => {}, groupEnd: () => {} };
        sinon.stub(backend, "push").callsFake((input, cb) => {
          results.push(input);
          cb();
        });
        sinon.stub(backend, "group").callsFake((name, cb) => {
          results.push({ group: name });
          cb();
        });
        sinon.stub(backend, "groupEnd").callsFake((cb) => {
          results.push({ groupEnd: true });
          cb();
        });

        // Setup the Manager:
        var eventLoop = [];
        var subject = new Manager({
          env: { scheduler: function(cb) { eventLoop.push(cb); } },
          backends: { console: backend }
        }, "APP");

        // Run the test:
        subject.group("LOGGER", "myGroup");
        subject.push({
          from: "LOGGER2", type: "log", message: "This is a message", level: 1, timestamp: "This is a timestamp", trace: "This is a trace"
        });
        subject.push({
          from: "LOGGER", type: "error", message: "This is a message 2", level: 2, timestamp: "This is a timestamp 2", trace: "This is a trace 2"
        });
        subject.group("LOGGER3", "myGroup");
        subject.push({
          from: "LOGGER", type: "log", message: "This is a message 3", level: 3, timestamp: "This is a timestamp 3", trace: "This is a trace 3"
        });
        subject.push({
          from: "LOGGER3", type: "info", message: "This is a message 4", level: 4, timestamp: "This is a timestamp 4", trace: "This is a trace 4"
        });
        subject.push({
          from: "LOGGER2", type: "log", message: "This is a message 5", level: 5, timestamp: "This is a timestamp 5", trace: "This is a trace 5"
        });
        subject.group("LOGGER2", "otherGroup");
        subject.groupEnd("LOGGER");
        subject.push({
          from: "LOGGER2", type: "warn", message: "This is a message 6", level: 6, timestamp: "This is a timestamp 6", trace: "This is a trace 6"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 7", level: 7, timestamp: "This is a timestamp 7", trace: "This is a trace 7"
        });
        subject.groupEnd("LOGGER3");
        subject.push({
          from: "LOGGER", type: "info", message: "This is a message 8", level: 8, timestamp: "This is a timestamp 8", trace: "This is a trace 8"
        });
        subject.push({
          from: "LOGGER3", type: "log", message: "This is a message 9", level: 9, timestamp: "This is a timestamp 9", trace: "This is a trace 9"
        });
        subject.push({
          from: "LOGGER2", type: "error", message: "This is a message 0", level: 10, timestamp: "This is a timestamp 0", trace: "This is a trace 0"
        });
        subject.groupEnd("LOGGER2");

        // Make sure that nothing has happened yet:
        assert.equal(results.length, 0, "The results were pushed before the process was executed.");

        // Drain the loop:
        while (eventLoop.length > 0) {
          assert.equal(eventLoop.length, 1, "The subject pushed more than 1 proceedure to the event loop");
          eventLoop.shift()();
        }

        // Check the results:
        assert.equal(results.length, 16, "There were not exactly 16 calls made by the subject to the backend");
        assert.deepEqual(results[0], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "log", message: "This is a message", level: 1, trace: "This is a trace", timestamp: "This is a timestamp"
        }, "The caller failed to provide the correct input for the first call");
        assert.deepEqual(results[1], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "log", message: "This is a message 5", level: 5, trace: "This is a trace 5", timestamp: "This is a timestamp 5"
        }, "The caller failed to provide the correct input for the fifth call");
        assert.deepEqual(results[2], { group: "myGroup" }, "The LOGGER group was not decalred or was declared incorrectly");
        assert.deepEqual(results[3], {
          origin: { app: "APP", logger: "LOGGER" }, type: "error", message: "This is a message 2", level: 2, trace: "This is a trace 2", timestamp: "This is a timestamp 2"
        }, "The caller failed to provide the correct input for the second call");
        assert.deepEqual(results[4], {
          origin: { app: "APP", logger: "LOGGER" }, type: "log", message: "This is a message 3", level: 3, trace: "This is a trace 3", timestamp: "This is a timestamp 3"
        }, "The caller failed to provide the correct input for the third call");
        assert.deepEqual(results[5], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
        assert.deepEqual(results[6], { group: "myGroup" }, "The LOGGER3 group was not decalred first or was declared incorrectly");
        assert.deepEqual(results[7], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "info", message: "This is a message 4", level: 4, trace: "This is a trace 4", timestamp: "This is a timestamp 4"
        }, "The caller failed to provide the correct input for the fourth call");
        assert.deepEqual(results[8], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 7", level: 7, trace: "This is a trace 7", timestamp: "This is a timestamp 7"
        }, "The caller failed to provide the correct input for the seventh call");
        assert.deepEqual(results[9], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
        assert.deepEqual(results[10], {
          origin: { app: "APP", logger: "LOGGER" }, type: "info", message: "This is a message 8", level: 8, trace: "This is a trace 8", timestamp: "This is a timestamp 8"
        }, "The caller failed to provide the correct input for the eighth call");
        assert.deepEqual(results[11], {
          origin: { app: "APP", logger: "LOGGER3" }, type: "log", message: "This is a message 9", level: 9, trace: "This is a trace 9", timestamp: "This is a timestamp 9"
        }, "The caller failed to provide the correct input for the ninth call");
        assert.deepEqual(results[12], { group: "otherGroup" }, "The LOGGER2 group was not decalred first or was declared incorrectly");
        assert.deepEqual(results[13], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "warn", message: "This is a message 6", level: 6, trace: "This is a trace 6", timestamp: "This is a timestamp 6"
        }, "The caller failed to provide the correct input for the sixth call");
        assert.deepEqual(results[14], {
          origin: { app: "APP", logger: "LOGGER2" }, type: "error", message: "This is a message 0", level: 10, trace: "This is a trace 0", timestamp: "This is a timestamp 0"
        }, "The caller failed to provide the correct input for the tenth call");
        assert.deepEqual(results[15], { groupEnd: true }, "The \"groupEnd\" call was not declared correctly at the end");
      });
    });
  });


  // ############################################
  // #                                          #
  // #    Test the loggerConfig functionality   #
  // #                                          #
  // ############################################


  /**
  * Provide testing for the `loggerConfig` function
  */
  describe("loggerConfig()", function() {
    /**
    * Provide testing for the `env.timestamp` function
    */
    describe("env.timestamp()", function() {
      /**
      * Make sure that the timestamp is controlled by the correct injection point
      */
      it("should respond to the `config.env` shim", function() {
        // Initialize the subject:
        var config = { env: { timestamp: sinon.spy() } };
        var subject = new Manager(config);

        // Make sure that the method has not yet been called:
        assert(!config.env.timestamp.called, "The shim was called early");

        // Call the method:
        subject.loggerConfig().env.timestamp();

        // Check the output:
        assert(config.env.timestamp.calledOnce, "The method failed to call the shim");
        assert.equal(subject.loggerConfig().env.timestamp, config.env.timestamp, "The method failed to expose the shim");
      });

      /**
      * Test the default method separately
      */
      describe("The default method", function() {
        /**
        * Ensure that the timestamp utility outputs a string
        */
        it("should return a string", function() {
          // Initialize the subject:
          var subject = new Manager({});

          // Check the output:
          assert.equal(typeof subject.loggerConfig().env.timestamp(), "string", "The timestamp was a \"" + typeof subject.loggerConfig().env.timestamp() + "\" value");
        });

        /**
        * Use a very long and complicated Regex modified from {@link https://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime|Stack Overflow}
        *   to ensure that the returned date is in ISO 8601 format.
        */
        it("should format all dates using the ISO 8601 standard", function() {
          // Initialize the subject:
          var subject = new Manager({});

          // Check the output:
          assert((/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/).test(subject.loggerConfig().env.timestamp()), "The timestamp did not match the ISO 8601 regex");
        });
      });
    });

    /**
    * Provide testing for the `env.timer` function
    */
    describe("env.timer()", function() {
      /**
      * Make sure that the `env.timer` function is properly loaded from the `config.env.timer` shim
      */
      it("should respond to the `config.env` shim", function() {
        // Initialize the subject:
        var config = { env: { timer: sinon.spy() } };
        var subject = new Manager(config);

        // Make sure that the method has not yet been called:
        assert(!config.env.timer.called, "The shim was called early");

        // Call the method:
        subject.loggerConfig().env.timer();

        // Check the output:
        assert(config.env.timer.calledOnce, "The method failed to call the shim");
        assert.equal(subject.loggerConfig().env.timer, config.env.timer, "The method failed to expose the shim");
      });

      /**
      * Test the default method separately
      */
      describe("The default method", function() {
        /**
        * Make sure that `env.timer` returns a number
        */
        it("should return a number", function() {
          // Initialize the subject:
          var subject = new Manager({});

          // Check the output:
          assert.equal(typeof subject.loggerConfig().env.timer(), "number", "The return type was \"" + typeof subject.loggerConfig().env.timer() + "\"");
        });

        /**
        * Make sure that `env.timer` returns the current time
        */
        it("should return the same value as `Date.now()`", function() {
          // Initialize the subject:
          var subject = new Manager({});

          // Check the output:
          assert(subject.loggerConfig().env.timer() === Date.now() || subject.loggerConfig().env.timer() === Date.now(), "The subject failed to yield the correct time");
        });
      });
    });

    /**
    * Provide testing for the `env.tracer` function
    */
    describe("env.tracer()", function() {
      /**
      * Make sure that the `env.tracer` function is properly loaded from the `config.env.tracer` shim
      */
      it("should respond to the `config.env` shim", function() {
        // Initialize the subject:
        var config = { env: { tracer: sinon.spy() } };
        var subject = new Manager(config);

        // Make sure that the method has not yet been called:
        assert(!config.env.tracer.called, "The shim was called early");

        // Call the method:
        subject.loggerConfig().env.tracer();

        // Check the output:
        assert(config.env.tracer.calledOnce, "The method failed to call the shim");
        assert.equal(subject.loggerConfig().env.tracer, config.env.tracer, "The method failed to expose the shim");
      });

      /**
      * Test the default method separately
      */
      describe("The default method", function() {
        /**
        * Make sure that `env.tracer` returns a string
        */
        it("should return a string", function() {
          // Initialize the subject:
          var subject = new Manager({});

          // Check the output:
          assert.equal(typeof subject.loggerConfig().env.tracer(), "string", "The return type was \"" + typeof subject.loggerConfig().env.tracer() + "\"");
        });

        /**
        * Make sure that `env.tracer` returns an accurate trace
        */
        it("should return an accurate stack trace", function() {
          // Initialize the subject:
          var subject = new Manager({});

          /**
          * Provides the first functional layer for the test's stacktrace
          * @return {string} The stack trace
          */
          var test = (function testBase() {
            /**
            * Provides the second layer of the test's stacktrace
            * @return {string} The stack trace
            */
            return (function testLayer1() {
              /**
              * Provides the third layer of the test's stacktrace
              * @return {string} The stack trace
              */
              return (function nextInnerLayer() {
                /**
                * Provides the fourth layer of the test's stacktrace
                * @return {string} The stack trace
                */
                return (function topInnerLayer() {
                  /**
                  * Provides the fifth and final layer of the test's stacktrace
                  * @return {string} The stack trace
                  */
                  return (function invisibleInternalCaller() {
                    return subject.loggerConfig().env.tracer().split("\n");
                  }());
                }());
              }());
            }());
          }());

          // Check the output:
          assert((/^topInnerLayer\s.*manager\.js:[0-9]{4}:20\)$/).test(test[0]), "The stacktrace failed the first regex test. The line was \"" + test[0] + "\"");
          assert((/^nextInnerLayer\s.*manager\.js:[0-9]{4}:18\)$/).test(test[1]), "The stacktrace failed the second regex test. The line was \"" + test[1] + "\"");
          assert((/^testLayer1\s.*manager\.js:[0-9]{4}:16\)$/).test(test[2]), "The stacktrace failed the third regex test. The line was \"" + test[2] + "\"");
          assert((/^testBase\s.*manager\.js:[0-9]{4}:14\)$/).test(test[3]), "The stacktrace failed the fourth regex test. The line was \"" + test[3] + "\"");
          assert((/^Context\.<anonymous>\s.*manager\.js:[0-9]{4}:12\)$/).test(test[4]), "The stacktrace failed the fifth regex test. The line was \"" + test[4] + "\"");
        });
      });
    });
  });
});
