window.callbacksFromOS = {};

var currentCallbackCounter = 0;

exports.executeSystemCommand = function(cmd, callback) {
  var cbName = (++currentCallbackCounter).toString(36);

  // Store callback and wrap it in a self-cleanup block
  window.callbacksFromOS[cbName] = function(data) {
    callback(data);
    window.callbacksFromOS[cbName] = null;
  };

  // Run through bash for better command parsing
  var command = "/bin/bash";
  var args = ["-c", cmd];

  // Send message and callback name to the Swift bridge
  webkit.messageHandlers.callbackHandler.postMessage({
    command: command,
    arguments: args,
    callbackFunction: cbName
  });
};

