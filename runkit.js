// ---------- DISCLAIMER: ----------
// In order to make RunKit load Woodsman as an AMD module, I've had to use kind of
// a nasty hack at the begining here. As such, if you're looking for a good example
// of how to load woodsman into your project, I highly recommend looking at our
// README.md file, located on the main GitHub page. Other than that, everything
// else should function about as normally as anything functions on RunKit.

// <HACK>
try { require("woodsman@1.0.0-ALPHA.0"); } catch(e) {}
var rjs = require("requirejs");
rjs([ require.resolve("woodsman@1.0.0-ALPHA.0") ], function(woodsman) {
// </HACK>

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
