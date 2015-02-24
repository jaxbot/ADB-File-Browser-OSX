var Store = require("../stores/Store");

module.exports = React.createClass({
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
    var file = this.props.file;
    return (
      <div>
        name: {file.name}
      </div>
    );
  }
});


