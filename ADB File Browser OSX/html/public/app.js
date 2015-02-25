(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AppDispatcher = require("../dispatchers/AppDispatcher");
var Constants = require("../constants/Constants.js");

module.exports = {
  selectFile: function(filekey, file) {
    AppDispatcher.dispatch({
      actionType: Constants.SELECT_FILE,
      file: file,
      filekey: filekey
    });
  },
  uploadFile: function() {
    AppDispatcher.dispatch({
      actionType: Constants.UPLOAD_FILE,
    });
  },
  downloadFile: function() {
    AppDispatcher.dispatch({
      actionType: Constants.DOWNLOAD_FILE,
    });
  },
  changeDir: function(filekey, file) {
    AppDispatcher.dispatch({
      actionType: Constants.CHANGE_DIR,
      filekey: filekey,
      file: file
    });
  }
};




},{"../constants/Constants.js":5,"../dispatchers/AppDispatcher":6}],2:[function(require,module,exports){
var Store = require("../stores/Store");
var File = require("./file");

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      selectedItem: 0
    };
  },
  componentDidMount: function() {
    Store.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    Store.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(Store.getFileTreeState(this.props.filekey));
  },
  render: function() {
    var state = this.state;
    var filekey = this.props.filekey;
    var files = Store.getFiles(filekey);
    var fileNodes = files.map(function (file) {
      var selected = (file.id == state.selectedItem);
      return (
        React.createElement(File, {file: file, selected: selected, filekey: filekey})
      );
    });
    return (
      React.createElement("div", {className: "filetree"}, 
        fileNodes
      )
    );
  }
});



},{"../stores/Store":7,"./file":4}],3:[function(require,module,exports){

var Store = require("../stores/Store");
var FileActions = require("../actions/FileActions");

module.exports = React.createClass({displayName: "exports",
  _upload: function() {
    FileActions.uploadFile();
  },
  _download: function() {
    FileActions.downloadFile();
  },
  render: function() {
    var file = this.props.file;
    var classes = this.props.selected ? "selected" : "";
    return (
      React.createElement("div", {className: "toolbar"}, 
        React.createElement("div", {className: "icon icon-arrow-right", onClick: this._upload}), 
        React.createElement("div", {className: "icon icon-arrow-left", onClick: this._download})
      )
    );
  }
});




},{"../actions/FileActions":1,"../stores/Store":7}],4:[function(require,module,exports){
var Store = require("../stores/Store");
var FileActions = require("../actions/FileActions");

module.exports = React.createClass({displayName: "exports",
  _clicked: function() {
    if (!this.props.selected) {
      FileActions.selectFile(this.props.filekey, this.props.file);
    } else if (this.props.file.directory) {
      FileActions.changeDir(this.props.filekey, this.props.file);
    }
  },
  render: function() {
    var file = this.props.file;
    var classes = "file " + (this.props.selected ? "selected" : "");
    var iconClass = "icon " + (file.directory ? "icon-folder-open" : "icon-file-empty");
    return (
      React.createElement("div", {className: classes, onClick: this._clicked}, 
        React.createElement("span", {className: iconClass}), 
        React.createElement("span", {className: "file-title"}, file.name)
      )
    );
  }
});




},{"../actions/FileActions":1,"../stores/Store":7}],5:[function(require,module,exports){
module.exports = {
  SELECT_FILE: 1,
  UPLOAD_FILE: 2,
  DOWNLOAD_FILE: 3,
  CHANGE_DIR: 4
};



},{}],6:[function(require,module,exports){
var Dispatcher = require("flux").Dispatcher;
module.exports = new Dispatcher();



},{"flux":8}],7:[function(require,module,exports){
var AppDispatcher = require("../dispatchers/AppDispatcher");
var Constants = require("../constants/Constants");

var Store = module.exports = (function() {
  var changeCallbacks = [];

  return {
    emitChange: function() {
      for (var i = 0; i < changeCallbacks.length; i++) {
        changeCallbacks[i]();
      }
    },
    addChangeListener: function(callback) {
      changeCallbacks.push(callback);
    },
    removeChangeListener: function(callback) {
      changeCallbacks.splice(changeCallbacks.indexOf(callback), 1);
    },
    getFileTreeState: function(filekey) {
      return states[filekey] || {};
    },
    getAllPins: function() {
      return _pins;
    },
    getPinListState: function() {
      return { currentPin: currentPin, show: showModals };
    },
    newPost: function(post) {
      post.id = Math.random();
      _pins.push(post);
    },
    setPins: function(data) {
      _pins = data;
    }
  };
})();


// Register callback to handle all updates
AppDispatcher.register(function(action) {
  var text;
  var state = states[action.filekey];

  if (!state) {
    state = (states[action.filekey] = {});
  }

  switch(action.actionType) {
    case Constants.SELECT_FILE:
      state.selectedItem = action.file.id;
      Store.emitChange();
      break;
    case Constants.UPLOAD_FILE:
      uploadFile();
      console.log("uploading " + states["local"].selectedItem + " to " + states["remote"].currentDirectory);
      break;
    case Constants.DOWNLOAD_FILE:
      console.log("downloading " + states["remote"].selectedItem + " to " + states["local"].currentDirectory);
      downloadFile();
      break;
    case Constants.CHANGE_DIR:
      state.currentDirectory += "/" + action.file.name;
      console.log(state.currentDirectory);
      updateDirectory(state, action.filekey);
      break;
    default:
      // no op
  }
});

function updateDirectory(state, filekey) {
  var command = "/bin/bash";
  var args = ["-c", (filekey == "remote" ? "/Users/jonathan/android/platform-tools/adb shell " : "") + "ls -la " + state.currentDirectory];
  executeSystemCommand(command, args, function(data) {
    var files = [];
    var lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].substring(0,1) == "t") {
        // "total X"
        continue;
      }
      var file = {};
      if (lines[i].substring(0,1) == "d") {
        file.directory = true;
      }
      var filename = lines[i].split(":");
      if (filename.length < 2) continue;
      filename = filename[1].split(" ");
      filename.shift();
      filename = filename.join(" ").trim();
      file.name = filename;
      file.id = i;

      files.push(file);
    }
    filesList[filekey] = files;

    Store.emitChange();
  });
}

window.callbacksFromOS = {};
function executeSystemCommand(command, arguments, callback) {
  var cbName = Math.random().toString(36);
  window.callbacksFromOS[cbName] = callback;
  console.log(window.callbacksFromOS);
  webkit.messageHandlers.callbackHandler.postMessage({ command: command, arguments: arguments, callbackFunction: cbName});
}

var filesList = {
  "local": [
    { "name": "Desktop", directory: true},
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts" },
    { "name": "butts.jpg"}
  ],
  "remote": [
    { "name": "..", directory: true },
    { "name": ".", directory: true},
    { "name": "DCIM", directory: true},
    { "name": "Desktop", directory: true},
    { "name": "Music", directory: true},
    { "name": "Chicken.txt"},
  ]
};
for (var i = 0; i < 400; i++) {
  filesList["local"].push({ "name": "butts.jpg"});
}
for (var i = 0; i < filesList["local"].length; i++) {
  filesList["local"][i].id = i;
}
for (var i = 0; i < filesList["remote"].length; i++) {
  filesList["remote"][i].id = i;
}
var states = {
  "local": {
    currentDirectory: "~"
  },
  "remote": {
    currentDirectory: "/sdcard/"
  }
};
module.exports.getFiles = function(key) {
  return filesList[key];
};

function getSelectedFile(filekey) {
  var selectedFile = null;
  for (var i = 0; i < filesList[filekey].length; i++) {
    if (filesList[filekey][i].id == states[filekey].selectedItem) {
      selectedFile = filesList[filekey][i];
      break;
    }
  }

  return selectedFile;
}

function downloadFile() {
  var selectedFile = getSelectedFile("remote");

  executeSystemCommand("/bin/bash", ["-c", "/Users/jonathan/android/platform-tools/adb pull \"" + states["remote"].currentDirectory + "/" + selectedFile.name + "\" " + states["local"].currentDirectory + "/"], function(data) {
    updateDirectory(states["local"], "local");
    Store.emitChange();
  });
}

function uploadFile() {
  var selectedFile = getSelectedFile("local");

  executeSystemCommand("/bin/bash", ["-c", "/Users/jonathan/android/platform-tools/adb push " + states["local"].currentDirectory + "/" + selectedFile.name + " " + states["remote"].currentDirectory + "/"], function(data) {
    updateDirectory(states["remote"], "remote");
    Store.emitChange();
  });
}


},{"../constants/Constants":5,"../dispatchers/AppDispatcher":6}],8:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher')

},{"./lib/Dispatcher":9}],9:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":10}],10:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],11:[function(require,module,exports){
var Store = require("./stores/Store");
var FileTree = require("./components/FileTree");
var Toolbar = require("./components/Toolbar");

window.onload = function() {
  React.render(
    React.createElement("div", null, 
      React.createElement(FileTree, {filekey: "local"}), 
      React.createElement(Toolbar, null), 
      React.createElement(FileTree, {filekey: "remote"})
    ),
    document.getElementById('frame')
  );
};



},{"./components/FileTree":2,"./components/Toolbar":3,"./stores/Store":7}]},{},[11]);
