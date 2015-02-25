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


