/**
* @fileoverview Test the functionality of the ConsoleBackend object
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
require("mocha-sinon");

// Configure the dependency loader:
req.config({
  baseUrl: "build",
  paths: {
    "woodsman": "woodsman.min"
  }
});

/**
* Provide the test suite for the console provider
*/
describe("The ConsoleBackend provider", function() {
  /**
  * Unspoof all console methods so that mocha can provide proper console output
  */
  function unSpoofConsole() {
    console.log.restore();
    console.info.restore();
    console.warn.restore();
    console.error.restore();
    console.group.restore();
    console.groupEnd.restore();
  }

  var Console;

  /**
  * Spoof all console methods to test output
  */
  beforeEach(function() {
    this.sinon.stub(console, "log");
    this.sinon.stub(console, "info");
    this.sinon.stub(console, "warn");
    this.sinon.stub(console, "error");
    this.sinon.stub(console, "group");
    this.sinon.stub(console, "groupEnd");
  });


  /**
  * Before anything else, load the woodsman library and initialize the test subject
  * @return {Promise} the asynchronous function which initializes the test
  */
  before(function() {
    return new Promise((resolve, reject) => {
      req([ "woodsman" ], (dependency) => {
        // Create a new ConsoleBackend object and store it in the subject variable:
        resolve(Console = dependency.backends.Console);
      }, (err) => {
        reject(err);
      });
    });
  });

  /**
  * Ensure that the subject has loaded correctly
  */
  it("should be an object containing \"push,\" \"group,\" & \"groupEnd\" functions", function() {
    var subject = new Console();

    assert.equal(typeof subject, "object", "The subject is not an object");
    assert.equal(typeof subject.push, "function", "The subject lacks a `push()` method");
    assert.equal(typeof subject.group, "function", "The subject lacks a `group()` method");
    assert.equal(typeof subject.groupEnd, "function", "The subject lacks a `groupEnd()` method");

    unSpoofConsole();
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
    it("should work when provided with minimal input", function() {
      var subject = new Console();

      // Send data:
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "log",
        level: 10,
        message: "This is a sample message"
      }, () => { /**/ });

      // Test output:
      assert(console.log.calledOnceWithExactly("[APP:LOGGER@10]: This is a sample message"), "The backend failed to push the correct message");
      assert(!console.info.called && !console.warn.called && !console.error.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });

    /**
    * Ensure that the callback is executed after the content is pushed
    */
    it("should call the callback uppon successful execution", function() {
      var subject = new Console();

      // Gather sample data:
      var cb = this.sinon.spy();

      // Send data:
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "log",
        level: 10,
        message: "This is a sample message"
      }, cb);

      // Test output:
      assert(console.log.calledOnceWithExactly("[APP:LOGGER@10]: This is a sample message"), "The backend failed to push the correct message");
      assert(cb.calledOnce, "The backend failed to call the callback function");
      assert(console.log.calledBefore(cb), "The callback function was not called before the push operation completed");
      assert(!console.info.called && !console.warn.called && !console.error.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });

    /**
    * Test the output when a stacktrace is added into the mix
    */
    it("should output the correct stacktrace", function() {
      var subject = new Console();

      // Gather sample data:
      var cb = this.sinon.spy();
      const ERR = new Error();

      // Send data:
      subject.push({
        app: "STUFF",
        logger: "THING",
        type: "log",
        level: 0,
        message: "Another message",
        trace: ERR.stack
      }, cb);

      // Test output:
      assert(console.log.calledOnceWithExactly("[STUFF:THING@0]: Another message\n" + ERR.stack), "The backend failed to push the correct message");
      assert(cb.calledOnce, "The backend failed to call the callback function");
      assert(console.log.calledBefore(cb), "The callback function was not called before the push operation completed");
      assert(!console.info.called && !console.warn.called && !console.error.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });

    /**
    * Test the output when a timestamp is added into the mix
    */
    it("should output the correct timestamp", function() {
      var subject = new Console();

      // Gather sample data:
      var cb = this.sinon.spy();
      const ERR = new Error();
      const NOW = new Date().toISOString();

      // Send data:
      subject.push({
        app: "first",
        logger: "second",
        type: "log",
        level: 80,
        message: "Another message",
        trace: ERR.stack,
        timestamp: NOW
      }, cb);

      // Test output:
      assert(console.log.calledOnceWithExactly("[first:second@80] " + NOW + ": Another message\n" + ERR.stack), "The backend failed to push the correct message");
      assert(cb.calledOnce, "The backend failed to call the callback function");
      assert(console.log.calledBefore(cb), "The callback function was not called before the push operation completed");
      assert(!console.info.called && !console.warn.called && !console.error.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });

    /**
    * Test the output when type is "info"
    */
    it("should work correctly for the \"info\" type", function() {
      var subject = new Console();

      // Gather sample data:
      var cb = this.sinon.spy();
      const ERR = new Error();
      const NOW = new Date().toISOString();

      // Send data:
      subject.push({
        app: "STUFF",
        logger: "THING",
        type: "info",
        level: 0,
        message: "Another message",
        trace: ERR.stack,
        timestamp: NOW
      }, cb);

      // Test output:
      assert(console.info.calledOnceWithExactly("[STUFF:THING@0] " + NOW + ": Another message\n" + ERR.stack), "The backend failed to push the correct message");
      assert(cb.calledOnce, "The backend failed to call the callback function");
      assert(console.info.calledBefore(cb), "The callback function was not called before the push operation completed");
      assert(!console.log.called && !console.warn.called && !console.error.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });

    /**
    * Test the output when type is "warn"
    */
    it("should work correctly for the \"warn\" type", function() {
      var subject = new Console();

      // Gather sample data:
      var cb = this.sinon.spy();
      const ERR = new Error();
      const NOW = new Date().toISOString();

      // Send data:
      subject.push({
        app: "STUFF",
        logger: "THING",
        type: "warn",
        level: 0,
        message: "Another message",
        trace: ERR.stack,
        timestamp: NOW
      }, cb);

      // Test output:
      assert(console.warn.calledOnceWithExactly("[STUFF:THING@0] " + NOW + ": Another message\n" + ERR.stack), "The backend failed to push the correct message");
      assert(cb.calledOnce, "The backend failed to call the callback function");
      assert(console.warn.calledBefore(cb), "The callback function was not called before the push operation completed");
      assert(!console.log.called && !console.info.called && !console.error.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });

    /**
    * Test the output when type is "error"
    */
    it("should work correctly for the \"error\" type", function() {
      var subject = new Console();

      // Gather sample data:
      var cb = this.sinon.spy();
      const ERR = new Error();
      const NOW = new Date().toISOString();

      // Send data:
      subject.push({
        app: "STUFF",
        logger: "THING",
        type: "error",
        level: 0,
        message: "Another message",
        trace: ERR.stack,
        timestamp: NOW
      }, cb);

      // Test output:
      assert(console.error.calledOnceWithExactly("[STUFF:THING@0] " + NOW + ": Another message\n" + ERR.stack), "The backend failed to push the correct message");
      assert(cb.calledOnce, "The backend failed to call the callback function");
      assert(console.error.calledBefore(cb), "The callback function was not called before the push operation completed");
      assert(!console.log.called && !console.info.called && !console.warn.called, "The backend made an additional call to the wrong console");

      // Un-spoof the console:
      unSpoofConsole();
    });
  });


  // ######################################
  // #                                    #
  // #    Test the group functionality    #
  // #                                    #
  // ######################################


  /**
  * Provide testing for the `group` function
  */
  describe("group()", function() {
    /**
    * I mean, there's basically nothing to test. Just make sure it forewards the call correctly
    */
    it("should properly foreward all calls to `console.group()`", function() {
      var subject = new Console();

      // Setup the callback:
      var cb = this.sinon.spy();
      // Send data:
      subject.group("This is a test grouping", cb);

      // Test output:
      assert(console.group.calledOnceWithExactly("This is a test grouping"), "The method failed to foreward the call to the backend with the correct parameters");
      assert(cb.calledOnce, "The callback was not called exactly once");
      assert(console.group.calledBefore(cb), "The method failed to call `console.group` before the callback");

      // Unspoof the console:
      unSpoofConsole();
    });
  });


  // ########################################
  // #                                      #
  // #    Test the groupEnd functionality   #
  // #                                      #
  // ########################################


  /**
  * Provide testing for the `groupEnd` function
  */
  describe("groupEnd()", function() {
    /**
    * Just make sure it forewards the call correctly
    */
    it("should properly foreward all calls to `console.groupEnd()`", function() {
      var subject = new Console();

      // Setup the callback:
      var cb = this.sinon.spy();

      // Send data:
      subject.groupEnd(cb);

      // Test output:
      assert(console.groupEnd.calledOnce, "The method failed to foreward the call to the backend");
      assert(cb.calledOnce, "The callback was not called exactly once");
      assert(console.groupEnd.calledBefore(cb), "The method failed to call `console.groupEnd` before the callback");

      // Unspoof the console:
      unSpoofConsole();
    });
  });


  // ####################################
  // #                                  #
  // #    Test the shim functionality   #
  // #                                  #
  // ####################################


  /**
  * Test the shim behavior
  */
  describe("The constructor shim", function() {
    /**
    * Make sure the shim functions properly when passed a fully functional console-shim
    */
    it("should function when passed a fully functional console-mockup", function() {
      // Prepare a fully functional console-mockup:
      var mockup = {
        log: this.sinon.spy(),
        info: this.sinon.spy(),
        warn: this.sinon.spy(),
        error: this.sinon.spy(),
        group: this.sinon.spy(),
        groupEnd: this.sinon.spy()
      };

      // Initialize the subject:
      var subject = new Console(mockup);

      // Send data:
      subject.group("My Group", () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "log",
        level: 10,
        message: "This is a sample log message"
      }, () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "info",
        level: 10,
        message: "This is a sample info message"
      }, () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "warn",
        level: 10,
        message: "This is a sample warn message"
      }, () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "error",
        level: 10,
        message: "This is a sample error message"
      }, () => { /**/ });
      subject.groupEnd(() => { /**/ });

      // Test output:
      assert(mockup.group.calledOnceWithExactly("My Group"), "The backend failed to call the \"group\" function properly");
      assert(mockup.log.calledOnceWithExactly("[APP:LOGGER@10]: This is a sample log message"), "The backend failed to push the correct message to \"log\"");
      assert(mockup.info.calledOnceWithExactly("[APP:LOGGER@10]: This is a sample info message"), "The backend failed to push the correct message to \"info\"");
      assert(mockup.warn.calledOnceWithExactly("[APP:LOGGER@10]: This is a sample warn message"), "The backend failed to push the correct message to \"warn\"");
      assert(mockup.error.calledOnceWithExactly("[APP:LOGGER@10]: This is a sample error message"), "The backend failed to push the correct message to \"error\"");
      assert(mockup.groupEnd.calledOnce, "The backend failed to call the \"groupEnd\" function");
      assert(mockup.group.calledBefore(mockup.log), "The backend failed to call \"group\" before \"log\"");
      assert(mockup.log.calledBefore(mockup.info), "The backend failed to call \"log\" before \"info\"");
      assert(mockup.info.calledBefore(mockup.warn), "The backend failed to call \"info\" before \"warn\"");
      assert(mockup.warn.calledBefore(mockup.error), "The backend failed to call \"warn\" before \"error\"");
      assert(mockup.error.calledBefore(mockup.groupEnd), "The backend failed to call \"error\" before \"groupEnd\"");

      // Unspoof the console:
      unSpoofConsole();
    });

    /**
    * Make sure the shim functions properly when passed a minimally functional console-shim
    */
    it("should function when passed a minimally functional console-mockup", function() {
      // Prepare a minimally functional console-mockup:
      var mockup = {
        log: this.sinon.spy()
      };

      // Initialize the subject:
      var subject = new Console(mockup);

      // Send data:
      subject.group("My Group", () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "log",
        level: 10,
        message: "This is a sample log message"
      }, () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "info",
        level: 10,
        message: "This is a sample info message"
      }, () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "warn",
        level: 10,
        message: "This is a sample warn message"
      }, () => { /**/ });
      subject.push({
        app: "APP",
        logger: "LOGGER",
        type: "error",
        level: 10,
        message: "This is a sample error message"
      }, () => { /**/ });
      subject.groupEnd(() => { /**/ });

      // Test output:
      assert.equal(mockup.log.callCount, 6, "The \"log\" method was not called exactly 6 times.");
      assert(mockup.log.getCall(0).calledWithExactly("---------- BEGIN GROUP \"My Group\" ----------"), "The \"group\" method failed to provide the expected output.");
      assert(mockup.log.getCall(1).calledWithExactly("[APP:LOGGER@10]: This is a sample log message"), "The \"log\" method failed to provide the expected output.");
      assert(mockup.log.getCall(2).calledWithExactly("[APP:LOGGER@10]: This is a sample info message"), "The \"info\" method failed to provide the expected output.");
      assert(mockup.log.getCall(3).calledWithExactly("[APP:LOGGER@10]: This is a sample warn message"), "The \"warn\" method failed to provide the expected output.");
      assert(mockup.log.getCall(4).calledWithExactly("[APP:LOGGER@10]: This is a sample error message"), "The \"error\" method failed to provide the expected output.");
      assert(mockup.log.getCall(5).calledWithExactly("---------- END GROUP ----------"), "The \"groupEnd\" method failed to provide the expected output.");

      // Unspoof the console:
      unSpoofConsole();
    });
  });
});
