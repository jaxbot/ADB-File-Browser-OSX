var Store = require("./stores/Store");
var FileTree = require("./components/FileTree");

window.onload = function() {
  React.render(
    <div>
      <FileTree filekey="local" />
      <div className="toolbar">
        <div className="icon">&gt;</div>
        <div className="icon">&lt;</div>
      </div>
      <FileTree filekey="remote" />
    </div>,
    document.getElementById('frame')
  );
};

