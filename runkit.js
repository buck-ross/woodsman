var woodsman = require("woodsman@1.0.0-ALPHA.1");

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

