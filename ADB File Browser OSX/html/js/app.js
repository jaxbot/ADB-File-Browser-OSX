var Store = require("./stores/Store");
var FileTree = require("./components/FileTree");

window.onload = function() {
  React.render(
    <div>
      <FileTree filekey="local" />
      <div>right arrow</div>
      <FileTree filekey="remote" />
    </div>,
    document.getElementById('frame')
  );
};

