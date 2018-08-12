/**
* @fileoverview Declare the manager interface
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
* Define a type of object to serve as the manager's configuration parameter
* @record
*/
var ManagerConfig = function() {};

/**
* @type {(undefined|{scheduler: (undefined|!function(!function(): undefined): undefined), timestamp: (undefined|?function(): string), timer: (undefined|?function(): number), tracer: (undefined|?function(): string)})}
*/
ManagerConfig.prototype.env;

/**
* @type {(undefined|Object<string, BackendAPI>)}
*/
ManagerConfig.prototype.backends;


/**
* Define a type of object to represent a single log entry transmitted from Logger to Manager
* @record
*/
var ManagerEntry = function() {};

/**
* @type {!string}
*/
ManagerEntry.prototype.from;

/**
* @type {!string}
*/
ManagerEntry.prototype.type;

/**
* @type {!string}
*/
ManagerEntry.prototype.message;

/**
* @type {!number}
*/
ManagerEntry.prototype.level;

/**
* @type {(undefined|string)}
*/
ManagerEntry.prototype.trace;

/**
* @type {(undefined|string)}
*/
ManagerEntry.prototype.timestamp;


/**
* The API exposed by `Manager` objects, primarially for use by `Logger` and `Waypoint` objects, and not intended so much for direct interaction
* @interface
*/
var ManagerAPI = function() {};

/**
* Retrieve the name of the application managed by the current Manager instance.
* @return {string} The retrieved name string.
*/
ManagerAPI.prototype.getName = function() {};

/**
* Allow the logger to push `SingleEntry` objects to the Manager
* @param {!ManagerEntry} entry The content of the logging entry
*/
ManagerAPI.prototype.push = function(entry) {};

/**
* Allow the logger to push a new grouping to it's group-stack
* @param {!string} from The name of the calling logger
* @param {(undefined|string)} name The name of the new group entry
*/
ManagerAPI.prototype.group = function(from, name) {};

/**
* Allow the logger to pop an existing grouping from it's group-stack
* @param {!string} from The name of the calling logger
*/
ManagerAPI.prototype.groupEnd = function(from) {};

/**
* Generate a `LoggerConfig` object for the provided `Logger`
* @return {LoggerConfig} The corresponding config object for the specified `Logger`
*/
ManagerAPI.prototype.loggerConfig = function() {};
