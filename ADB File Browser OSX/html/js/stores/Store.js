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
