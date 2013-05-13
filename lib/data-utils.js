(function() {
  var ask, itemSorter,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ask = function(question, format, callback, range) {
    var stdin, stdout;

    stdin = process.stdin;
    stdout = process.stdout;
    stdin.resume();
    stdout.write(question + ": ");
    return stdin.once('data', function(data) {
      var _ref;

      data = data.toString().trim();
      if (range != null) {
        if (_ref = parseInt(data), __indexOf.call(range, _ref) >= 0) {
          callback(data);
          return;
        }
      } else if (format.test(data)) {
        callback(data);
        return;
      }
      stdout.write("It should match: " + format + "\n");
      return ask(question, format, callback, range);
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
