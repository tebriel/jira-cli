(function() {
  var JiraCli, jira;

  jira = require('jira-api');

  JiraCli = (function() {

    function JiraCli() {
      this.options = {
        config: {
          "username": "cmoultrie",
          "passowrd": "Kindle&fall10",
          "host": "http://jira.endgames.local/"
        },
        issueIdOrKey: "EG-135"
      };
    }

    JiraCli.prototype.getIssue = function() {
      return jira.issue.get(this.options, function(response) {
        return console.log(JSON.stringify(response, null, 4));
      });
    };

    return JiraCli;

  })();

  module.exports = {
    JiraCli: JiraCli
  };

}).call(this);
