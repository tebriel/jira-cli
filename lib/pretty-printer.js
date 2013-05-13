(function() {
  var PrettyPrinter, color, wrap;

  color = require('ansi-color').set;

  wrap = require('wordwrap')(5, 65);

  PrettyPrinter = (function() {
    function PrettyPrinter() {}

    PrettyPrinter.prototype.prettyPrintIssue = function(issue, detail) {
      var sumColor, _ref;

      sumColor = "green";
      if ((_ref = +issue.fields.status.id) === 5 || _ref === 6) {
        sumColor = "red";
      }
      process.stdout.write(color(issue.key, sumColor + "+bold"));
      if (issue.fields.summary == null) {
        issue.fields.summary = "None";
      }
      process.stdout.write(" - ");
      process.stdout.write(issue.fields.summary);
      process.stdout.write("\n");
      if (detail && (issue.fields.description != null)) {
        process.stdout.write(color("Description:\n", "white+bold"));
        process.stdout.write(wrap(issue.fields.description));
        return process.stdout.write("\n\n");
      }
    };

    PrettyPrinter.prototype.prettyPrintIssueTypes = function(issueType, index) {
      process.stdout.write(color(index, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(issueType.name);
      if (issueType.description.length > 0) {
        process.stdout.write(" - ");
        process.stdout.write(issueType.description);
      }
      return process.stdout.write("\n");
    };

    PrettyPrinter.prototype.prettyPrintTransition = function(transition, index) {
      process.stdout.write(color(index, "white+bold"));
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
