
var Store = require("../stores/Store");
var FileActions = require("../actions/FileActions");

module.exports = React.createClass({
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
      <div className="toolbar">
        <div className="icon icon-arrow-right2" onClick={this._upload}></div>
        <div className="icon icon-arrow-left2" onClick={this._download}></div>
      </div>
    );
  }
});


