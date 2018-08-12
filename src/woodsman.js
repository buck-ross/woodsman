/**
* @fileoverview Define the provided implementation for all Woodsman APIs
* @author Haximilian <haximilian@gmail.com>
* @module woodsman
* @copyright Copyright (C) 2018 Haximilian
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

// Declare the module using the AMD "define" standard:
define(() => {
  "use strict";


  // ###################################
  // #                                 #
  // #    Define the `Manager` class   #
  // #                                 #
  // ###################################


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
  var Manager = function(config, appName) {
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
        for (let key in config.backends)
          if (Object.prototype.hasOwnProperty.call(config.backends, key))
            this.backends.push({
              name: key,
              handle: config.backends[key]
            });

      // Setup the messaging queues:
      this.processing = false;
      this.queue = [];
      this.groups = {};
  };

  /**
  * Execute the actual process of formatting the logging content & transfering it to the backends
  */
  Manager.prototype.process = function() {
    // Preserve the "this" reference for scheduled functions:
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
      if (typeof that.queue[queueIndex].name === "string") {
        // Deal with group elements:
        if (typeof that.queue[queueIndex].group[groupIndex].group === "string")
          tmpEntry = { group: that.queue[queueIndex].group[groupIndex].group };

        // Deal with groupEnd elements:
        else if (that.queue[queueIndex].group[groupIndex].groupEnd)
          tmpEntry = { groupEnd: true };

        // Deal with all other internal elements:
        else
          tmpEntry = {
            origin: {
              app: that.name,
              logger: that.queue[queueIndex].group[groupIndex].from
            },
            type: that.queue[queueIndex].group[groupIndex].type,
            message: that.queue[queueIndex].group[groupIndex].message,
            level: that.queue[queueIndex].group[groupIndex].level,
            trace: that.queue[queueIndex].group[groupIndex].trace,
            timestamp: that.queue[queueIndex].group[groupIndex].timestamp
          };

        // Change the Group Index:
        if (++groupIndex === that.queue[queueIndex].group.length)
          groupIndex = 0;

      // Deal with individual entries:
      } else
        tmpEntry = {
          origin: {
            app: that.name,
            logger: that.queue[queueIndex].from
          },
          type: that.queue[queueIndex].type,
          message: that.queue[queueIndex].message,
          level: that.queue[queueIndex].level,
          trace: that.queue[queueIndex].trace,
          timestamp: that.queue[queueIndex].timestamp
        };

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
    if (typeof this.groups[entry.from] === "undefined") {
      this.queue.push(entry);

      // If the queue is not currently being processed, trigger the processing system:
      if (!this.processing)
        this.process();
    } else
      this.groups[entry.from].group.push(entry);
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
        this.process();
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


  // ##################################
  // #                                #
  // #    Define the `Logger` class   #
  // #                                #
  // ##################################


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
  var Logger = function(parent, name) {
    // Begin declaring the internal variables:
    this.manager = parent;
    this.config = parent.loggerConfig();
    this.loggerName = name;
    this.defaultLevel = 0;
  };

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


  // ##########################################
  // #                                        #
  // #    Define the `ConsoleBackend` class   #
  // #                                        #
  // ##########################################


  /**
  * Create a Console
  * @memberof woodsman
  * @implements {BackendAPI}
  * @constructor
  */
  var Console = function() {}; // eslint-disable-line no-empty-function

  /**
  * Push the provided entry or group of entries to the backend.
  * @override
  * @param {!BackendEntry} input The data to be pushed to the backend.
  * @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
  *   However, this callback function must always be called once the pushing process has completed.
  */
  Console.prototype.push = function(input, callback) {
    // Assemble the message to print to the console:
    var message = "[" + input.origin.app + ":" + input.origin.logger + "@" + input.level + "]";
    if (input.timestamp)
      message += " " + input.timestamp;
    message += ": " + input.message;
    if (input.trace)
      message += "\n" + input.trace;

    // Print the message to the console:
    console[input["type"]](message);
    callback();
  };

  /**
  * Cause the backend to treat all subsequent entries as members of a group with the specified name.
  * @override
  * @param {!string} name The name of the group.
  * @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
  */
  Console.prototype.group = function(name, callback) {
    console.group(name);
    callback();
  };

  /**
  * Terminate the newest active group within the logging system
  * @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
  * @override
  */
  Console.prototype.groupEnd = function(callback) {
    console.groupEnd();
    callback();
  };


  // ####################################
  // #                                  #
  // #    Return the completed module   #
  // #                                  #
  // ####################################


  return {
    // All properties names must be strings in order to preserve their names during the compilaion process
    "Manager": Manager,
    "Logger": Logger,
    "backends": {
      "Console": Console
    }
  };
});
