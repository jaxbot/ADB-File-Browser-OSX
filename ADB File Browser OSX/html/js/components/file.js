var Store = require("../stores/Store");
var FileActions = require("../actions/FileActions");

module.exports = React.createClass({
  _select: function() {
    FileActions.selectFile(this.props.filekey, this.props.file);
  },
  render: function() {
    var file = this.props.file;
    var classes = this.props.selected ? "selected" : "";
    return (
      <div className={classes} onClick={this._select}>
        {file.name}
      </div>
    );
  }
});


