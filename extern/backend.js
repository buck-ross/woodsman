/**
* @fileoverview Define an interface for the backend plugins such that the logger can communicate with them.
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
* Define a type of object to represent a single entry within the logging system.
* @record
*/
var BackendEntry = function() {};

// Define all of the common, mandatory fields:
/**
* @type {!{app: !string, logger: !string}}
*/
BackendEntry.prototype.origin;

/**
* @type {!string}
*/
BackendEntry.prototype.type;

/**
* @type {!string}
*/
BackendEntry.prototype.message;

/**
* @type {!number}
*/
BackendEntry.prototype.level;

// Define all fields which are generally optional and depend on platform and configuration:
/**
* @type {(undefined|string)}
*/
BackendEntry.prototype.trace;

/**
* @type {(undefined|number)}
*/
BackendEntry.prototype.timestamp;


/**
* The interface exposed by all `Backend` objects to allow them to interact properly with the `Manager`s.
* @interface
*/
function BackendAPI() {}

/**
* Push the provided entry or group of entries to the backend.
* @param {!BackendEntry} input The data to be pushed to the backend.
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*   However, this callback function must always be called once the pushing process has completed.
*/
BackendAPI.prototype.push = function(input, callback) {};

/**
* Cause the backend to treat all subsequent entries as members of a group with the specified name.
* @param {!string} name The name of the group.
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*/
BackendAPI.prototype.group = function(name, callback) {};

/**
* Terminate the newest active group within the logging system
* @param {!function(): null} callback Push is neither explicitly synchronous nor explicitly asynchronous.
*/
BackendAPI.prototype.groupEnd = function(callback) {};
