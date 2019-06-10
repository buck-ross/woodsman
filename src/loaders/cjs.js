/*
* @fileoverview Wrap all Woodsman APIs and export for use in an CommonJS environment
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



// Import all dependencies:
import Manager from "../manager.js";
import Logger from "../logger.js";
import Console from "../backends/console.js";

// All properties names must be strings in order to preserve their names during the compilaion process
// eslint-disable-next-line no-undef
module.exports = {
	"Manager": Manager,
	"Logger": Logger,
	"backends": {
		"Console": Console
	}
};

// ex: set ft=javascript ff=unix ts=4 sw=4 tw=0 noet :

