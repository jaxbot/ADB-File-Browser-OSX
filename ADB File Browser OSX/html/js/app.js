var Store = require("./stores/Store");
var FileTree = require("./components/FileTree");
var Toolbar = require("./components/Toolbar");

Store.updateDirectory("local");
Store.updateDirectory("remote");

window.onload = function() {
  React.render(
    <div className="wrapper">
      <FileTree filekey="local" icon="display" />
      <Toolbar />
      <FileTree filekey="remote" icon="android" />
    </div>,
    document.getElementById('frame')
  );
};

