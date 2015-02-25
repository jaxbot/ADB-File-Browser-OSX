var Store = require("./stores/Store");
var FileTree = require("./components/FileTree");
var Toolbar = require("./components/Toolbar");

window.onload = function() {
  React.render(
    <div>
      <FileTree filekey="local" />
      <Toolbar />
      <FileTree filekey="remote" />
    </div>,
    document.getElementById('frame')
  );
};

