/**
* @fileoverview Declare the logger interface
* @author Haximilian<haximilian@gmail.com>
* @externs
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

/**
* Define a record type for the Logger configuration object
* @record
*/
var LoggerConfig = function() {};

/**
* @type {{timestamp: ?function(): string, timer: ?function(): number, tracer: (undefined|?function(): string)}}
*/
LoggerConfig.prototype.env;

/**
* The interface exposed by all `Logger` objects to allow for simple, straightforward use inside applications
* @interface
*/
var LoggerAPI = function() {};

/**
* Get the namespace of the current logger object.
* @return {!{app: !string, logger: !string}} An object consisting of two fields, each containing strings:<br/>
*   `app`: The name of the application under which the current logger is instantiated<br/>
*   `logger`: The name assigned to the current logger instance
*/
LoggerAPI.prototype.getNamespace = function() {};

/**
* Get the default logging-level of the current logger instance.
* If it has not been otherwise specified by calling `setDefaultLevel` the default level should be `0`.
* @return {!number} The default logging level.
*/
LoggerAPI.prototype.getDefaultLevel = function() {};

/**
* Set the default logging-level of the current logger instance.
* @param {!number} level The new default level of the logger object
*/
LoggerAPI.prototype.setDefaultLevel = function(level) {};

/**
* Commit an Object or String to the logging system as a basic log entry.
* @param {!string} message The parameter to be committed.
* @param {(undefined|number)} [level] The logging level of the message.
*/
LoggerAPI.prototype.log = function(message, level) {};

/**
* Commit an Object or String to the logging system as an informational entry.
* @param {!string} message The parameter to be committed.
* @param {(undefined|number)} [level] The logging level of the message.
*/
LoggerAPI.prototype.info = function(message, level) {};

/**
* Commit an Object or String to the logging system as a warning entry.
* @param {!string} message The parameter to be committed.
* @param {(undefined|number)} [level] The logging level of the message.
*/
LoggerAPI.prototype.warn = function(message, level) {};

/**
* Commit an Object or String to the logging system as an error entry.
* @param {!string} message The parameter to be committed.
* @param {(undefined|number)} [level] The logging level of the message.
*/
LoggerAPI.prototype.error = function(message, level) {};

/**
* Tell the manager to group all subsequent messages together until "groupEnd" is called when the created group is on top of the group-stack.
* @param {(undefined|string)} [groupName] The name of the group to create.
*/
LoggerAPI.prototype.group = function(groupName) {};

/**
* End the group on the top of the group stack & flush its contents to the manager.
*/
LoggerAPI.prototype.groupEnd = function() {};
