(function() {
  var PrettyPrinter, color;

  color = require('ansi-color').set;

  PrettyPrinter = (function() {

    function PrettyPrinter() {}

    PrettyPrinter.prototype.prettyPrintIssue = function(issue) {
      var sumColor, _ref;
      sumColor = "green";
      if ((_ref = +issue.fields.status.id) === 5 || _ref === 6) {
        sumColor = "red";
      }
      process.stdout.write(color(issue.key, sumColor));
      process.stdout.write(" - ");
      process.stdout.write(issue.fields.summary);
      return process.stdout.write("\n");
    };

    PrettyPrinter.prototype.prettyPrintIssueTypes = function(issueType) {
      process.stdout.write(color(issueType.id, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(issueType.name);
      if (issueType.description.length > 0) {
        process.stdout.write(" - ");
        process.stdout.write(issueType.description);
      }
      return process.stdout.write("\n");
    };

    PrettyPrinter.prototype.prettyPrintTransition = function(transition) {
      process.stdout.write(color(transition.id, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(transition.name);
      return process.stdout.write("\n");
    };

    PrettyPrinter.prototype.prettyPrintProject = function(project) {
      var key;
      key = project.key;
      while (key.length < 12) {
        key = ' ' + key;
      }
      process.stdout.write(color(key, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(project.id);
      process.stdout.write(" - ");
      process.stdout.write(project.name);
      return process.stdout.write("\n");
    };

    return PrettyPrinter;

  })();

  module.exports = {
    PrettyPrinter: PrettyPrinter
  };

}).call(this);
