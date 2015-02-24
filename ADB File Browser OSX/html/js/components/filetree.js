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
    this.setState(Store.getPinState(this.props.pin.id));
  },
  render: function() {
    var files = Store.getFiles(this.props.filekey);
    var fileNodes = files.map(function (file) {
      return (
        <File file={file} />
      );
    });
    return (
      <div>
        {fileNodes}
      </div>
    );
  }
});

