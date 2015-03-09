var Store = require("../stores/Store");
var File = require("./file");

module.exports = React.createClass({
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
    var iconName = "icon-large icon-" + this.props.icon;
    var files = Store.getFiles(filekey);
    var error = state.noDevice ? <div>Failed to find device. Make sure your Android is plugged in with USB, adb debugging is enabled, and you have accepted the RSA key from your computer on your Android phone. For more info, do a google search for "adb android".</div> : null;
    var fileNodes = files.map(function (file) {
      var selected = (file.id == state.selectedItem);
      return (
        <File file={file} selected={selected} filekey={filekey} />
      );
    });
    return (
      <div className="filepane">
        <div className={iconName}></div>
        <div className="filelist">
          {error}
          {fileNodes}
        </div>
      </div>
    );
  }
});

