var AppDispatcher = require("../dispatchers/AppDispatcher");
var Constants = require("../constants/Constants");
var SwiftLink = require("../helpers/SwiftLink");
var Mockdata = require("../helpers/Mockdata");

var filesList = {
  "local": [
  ],
  "remote": [
  ]
};

var states = {
  "local": {
    currentDirectory: "~"
  },
  "remote": {
    currentDirectory: "/sdcard/"
  }
};


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
    updateDirectory: updateDirectory
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
      break;
    case Constants.DOWNLOAD_FILE:
      downloadFile();
      break;
    case Constants.CHANGE_DIR:
      state.currentDirectory += "/" + action.file.name;
      updateDirectory(action.filekey);
      break;
    default:
      // no op
  }
});

function updateDirectory(filekey) {
  var state = states[filekey];

  if (!window.webkit) {
    filesList[filekey] = Mockdata();
    return;
  }

  SwiftLink.executeSystemCommand("which adb", function(data) {});

  var cmd = (filekey == "remote" ? ADB() + " shell " : "") + "ls -la " + state.currentDirectory;
  SwiftLink.executeSystemCommand(cmd, function(data) {
    if (data === '') {
      state.noDevice = true;
      Store.emitChange();
      return;
    }

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

    // Sort directories on top
    var directoryCount = 0;
    for (var i = 0; i < files.length; i++) {
      if (files[i].directory) {
        var file = files.splice(i, 1)[0];
        files.splice(directoryCount++, 0, file);
      }
    }
    filesList[filekey] = files;

    Store.emitChange();
  });
}

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

  SwiftLink.executeSystemCommand(ADB() + " pull \"" + states["remote"].currentDirectory + "/" + selectedFile.name + "\" " + states["local"].currentDirectory + "/", function(data) {
    updateDirectory("local");
    Store.emitChange();
  });
}

function uploadFile() {
  var selectedFile = getSelectedFile("local");

  SwiftLink.executeSystemCommand(ADB() + " push " + states["local"].currentDirectory + "/" + selectedFile.name + " " + states["remote"].currentDirectory + "/", function(data) {
    updateDirectory("remote");
    Store.emitChange();
  });
}

function ADB() {
  var cwd = window.cwd;
  cwd = cwd.split("/");
  cwd.pop();
  cwd.pop();
  cwd = cwd.join("/");
  cwd += "/Resources";

  return cwd.replace(/\s/g, "\\ ") + "/adb";
}
