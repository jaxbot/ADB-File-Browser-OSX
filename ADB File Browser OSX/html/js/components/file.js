var Store = require("../stores/Store");
var FileActions = require("../actions/FileActions");

module.exports = React.createClass({
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
      <div className={classes} onClick={this._clicked}>
        <span className={iconClass} />
        <span className="file-title">{file.name}</span>
      </div>
    );
  }
});


