(function() {
  var ask, itemSorter;

  ask = function(question, format, callback) {
    var stdin, stdout;
    stdin = process.stdin;
    stdout = process.stdout;
    stdin.resume();
    stdout.write(question + ": ");
    return stdin.once('data', function(data) {
      data = data.toString().trim();
      if (format.test(data)) {
        return callback(data);
      } else {
        stdout.write("It should match: " + format + "\n");
        return ask(question, format, callback);
      }
    });
  };

  itemSorter = function(a, b) {
    var first, second;
    first = parseInt(a.id);
    second = parseInt(b.id);
    if (first < second) {
      return -1;
    }
    if (first === second) {
      return 0;
    }
    if (first > second) {
      return 1;
    }
  };

  module.exports = {
    ask: ask,
    itemSorter: itemSorter
  };

}).call(this);
