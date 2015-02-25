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
    var classes = this.props.selected ? "selected" : "";
    return (
      <div className={classes} onClick={this._clicked}>
        {file.name}
      </div>
    );
  }
});


