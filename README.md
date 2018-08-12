# Woodsman
An Open Source logging API for JavaScript applications of all shapes and sizes.

![NPM License](https://img.shields.io/npm/l/woodsman.svg)
![NPM Version](https://img.shields.io/npm/v/woodsman.svg)
[![Examples](https://www.libhive.com/providers/npm/packages/woodsman/examples/badge.svg)](https://www.libhive.com/providers/npm/packages/woodsman)
[![Join the chat at https://gitter.im/haximilian/woodsman](https://badges.gitter.im/haximilian/woodsman.svg)](https://gitter.im/haximilian/woodsman?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
![NPM Downloads](https://img.shields.io/npm/dt/woodsman.svg)
![NPM Downloads/week](https://img.shields.io/npm/dw/woodsman.svg)
![Module Format: AMD](https://img.shields.io/badge/module%20format-amd-blue.svg)

## Getting Started
First, install *Woodsman* into your project. The recommended way of doing this is using [NPM](https://www.npmjs.com/) with the `--save` or `-P` option to save *Woodsman* as a dependency in your `package.json` file:

> npm i -P woodsman

If you haven't already, go ahead and install an [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) loader of your choice to load *Woodsman*. We recommend [RequireJS](http://requirejs.org/), although you should theoretically be able to use any loader that follows the AMD standard. You can install RequireJS like this:

> npm i -P requirejs

You can now include woodsman in your project. Here's an example:

```javascript
require([ "woodsman" ], function(woodsman) {

  // Create an application manager:
  var manager = new woodsman.Manager({
    backends: {
      // Add a backend to output logged data to the console:
      myConsole: new woodsman.backends.Console()
    }
  }, "myApp");

  // Create your first logger:
  var logger = new woodsman.Logger(manager, "myLogger");

  // Log some data:
  logger.log("It works!");

});
```

## The Woodsman API

The woodsman library can be broken down into three components: [Loggers](#loggers), [Managers](#managers), and [Backends](#backends). We'll provide a brief overview here, but the most accurate information can be found in the API definitions inside the *externs* directory of this project. A more readable version of that information can be obtained from the *build/jsdoc* directory after building the documentation like so:

> npm run doc

### Loggers
`Logger`s serve as the primary interface between *Woodsman* and the programs which utilize it. To instantiate a new Logger, simply call `var logger = new woodsman.Logger(manager, name)` where `manager` is your application's [Manager](#managers) instance, and `name` is a unique `string` to indicate which Logger instance a particular message came from. Note that the `name` need only be unique relative to the names of all other Loggers which refer to the same Manager.

#### Logger Namespace
The pairing of the logger name and the manager name is referred to as the logger's "namespace". To obtain the namesapce of a given logger, simply call `logger.getNamespace()`. The returned object contains two parts: the `app` string representing the name of the `Manager` instance, and the `logger` string representing the name of the `Logger` instance.

#### Logging Messages
Each logger implements an interface designed to be particularly simple and easy to use for anyone already familiar with the native `console` object. Thes methods include `logger.log()`, `logger.info()`, `logger.warn()`, and `logger.error()`. Each of these methods requires a single `string` parameter to represent the message which will be logged.

Additionally, each of the above methods allows for an optional second parameter, in the form of a `number` (preferably an integer) which will represent the level of specificity/severity/general importance the message being logged. Generally speaking, the greater the level, the more specific the entry should be, with zero being the most general. If the call does not specify a level, the logger will apply the default level to the message, which is zero by default, but can be specified by changed by calling `logger.getDefaultLevel()` & `loger.setDefaultLevel(newLevel)`.
```javascript
logger.log("This is just a regular logging entry");
logger.info("This is an info entry. It has slightly higher precedence than \"log\" entries");
logger.warn("When it looks like there might be a problem, you can log a warning");
logger.error("Record errors whenever something actually goes wrong");

logger.log("This entry is slightly more specific than other log entries.", 1);
logger.log("And this one is even more specific", 2);
logger.log("Up to whatever point of specificity you want :)", 50000);
```

#### Logging Groups
Aside from the basic loging methods, the logger also provides functionality to group logging entries together. Once `logger.group()` is called, all subsequent entries will be treated as a logging group until `logger.groupEnd()` is called. The name of the group can be specified via an optional `string` parameter in the initial call to `logger.group()`. For example:
```javascript
logger.log("This is not in a group");

// This is what a group looks like:
logger.group("myGroup");
logger.log("I'm inside of \"myGroup\"");
logger.groupEnd();
```
Nested groups are supported.

### Managers
The `Manager`'s function is to provide a centralized place for configuring the behavior of the logging system. The manager is also responsible for collecting all output from its associated [`Logger`](#loggers) objects, and sending it on to the [`Backend`](#backends)s.

The `Manager` class can be instantiated by calling `var manager = new woodsman.Manager(config, name)`, where `config` is the [manager configuration object](#manager-config), and `name` is a `string` representing the name of the application that you want to appear in logging messages.

#### Manager Name
The name of a given Manager object must be specified as the second parameter of its constructor, and can be retrieved in `string` by calling `manager.getName()`.

#### Manager Config
The `config` parameter is an object which can optionally contain to sub-objects: `config.env` and `config.backends`.

The `backends` section is where you must specify the all of the backend locations where *Woodsman* will send your data. To specify a backend, you must provide a name for it and its handle. For example, in order to tell *Woodsman* to send data to the JavaScript *console* via a [*Console*](#console) backend named "myConsole", you would provide the following config object:
```javascript
var Manager = new woodsman.Manager({
  backends: {
    // Create a new Console backend named "myConsole""
    myConsole: new woodsman.backends.Console()
  }
}, "myApp");
```

The `env` section is more complicated, and **can generally be omitted**. It is provided to expose a number of environment-specific shims used throughout *Woodsman*. `env.scheduler` can provide a scheduling API, taking a single callback parameter. `env.timestamp` can provide a function returning an *ISO 8601 complient* timestamp as a `string`. `env.timer` can provide a function which returns a `number` representing some consistent time measurement in milliseconds. `env.tracer` can provide a method which returns an accurate stack-trace as a `string`, starting from the method below the caller. All of these parameters are optional and have default methods implemented within *Woodsman*, but sometimes it is desirable to fine-tune these implementations for the target platform. Additionally, all of these methods can be prevented from running by specifying a `null` value, except for `env.scheduler` which can never be `null`.
```javascript
var manager = new Manager({
  env: {
    // Specify a synchronous scheduling API (not recommended):
    scheduler: function(callback) { callback(); },

    // Provide a custom stack-trace method:
    tracer: function() { /* Generate a stack trace here */ return trace; },

    // Do not allow Woodsman to provide timestamps:
    timestamp: null
  }
}, "myApp");
```

### Backends
Backend objects represent different locations where logging information can be sent. These can include the JavaScript `console`, `div` elements within a DOM, server logging files, and even remote log-collection servers. For more information on implementing the Backend API, please [generate the appropriate docs](#the-woodsman-api). Additionally, *Woodsman* provides a set of builtin `Backend` objects to choose from:

#### Console Backend
The `Console` is about as simple as it gets. It just takes output from *Woodsman*, re-formats it into a` string`, and outputs it to the built-in `console` object. Constructing a `Console` Backend can be done by calling `var myConsole = new woodsman.backends.Console()`, but is is more usual to see it written inline within the [Manager Config](#manager-config).

## Interacting with our Community
Welcome to the *Woodsman* Community! We're happy you're here! We're doing our best to make *Woodsman* be the perfect logging API that you always wanted, but before you reach out to us with your questions or complaints, please be sure to read through the following documents to help streamline all correspondence and make the process as pleasant and headache-free as possible:
 - [Our Code of Conduct](.github/CODE_OF_CONDUCT.md)
 - [Our Contributor Guidelines](.github/CONTRIBUTING.md)
 - [A Template for reporting Bugs/Issues](.github/ISSUE_TEMPLATE/bug_report.md)
 - [A Template for proposing new Features](.github/ISSUE_TEMPLATE/feature_request.md)
 - [A Template for creating Pull Requests](.github/PULL_REQUEST_TEMPLATE.md)
 - [Our Legal Licensing Statement (AGPL 3.0)](LICENSE.md)

# [<img src="https://opensource.org/files/osi_symbol.png" width="50">](https://opensource.org/licenses/AGPL-3.0) License
Copyright &copy; 2018 Haximilian<br/>
**This project is licensed under the [GNU Affero General Public License Agreement v3.0 (AGPL-3.0)](https://opensource.org/licenses/AGPL-3.0).**<br>
For a complete copy of the license, please see the included "LICENSE.md" file.
