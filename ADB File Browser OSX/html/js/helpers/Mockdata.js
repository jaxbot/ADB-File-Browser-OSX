var names = ["summer.jpg", "notes.txt", "system32.dll", "images", "DCIM"];

module.exports = function() {
  var files = [{ name: "..", directory: true, id: 0}, { name: ".", directory: true, id: 1 }];

  for (var i = 0; i < 100 + Math.random() * 100; i++) {
    var name = names[Math.floor(names.length * Math.random())];
    files.push({ name: name, directory: Math.random() > 0.5, id: i + 2 });
  }

  return files;
};
