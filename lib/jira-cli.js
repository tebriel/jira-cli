(function() {
  var JiraApi, JiraHelper, PrettyPrinter, color;

  color = require('ansi-color').set;

  PrettyPrinter = require('./pretty-printer').PrettyPrinter;

  JiraApi = require('jira').JiraApi;

  JiraHelper = (function() {

    function JiraHelper(config) {
      this.config = config;
      this.jira = new JiraApi('http', this.config.host, this.config.port, this.config.user, this.config.password, '2');
      this.response = null;
      this.error = null;
      this.pp = new PrettyPrinter;
    }

    JiraHelper.prototype.getIssue = function(issueNum, details) {
      var _this = this;
      return this.jira.findIssue(issueNum, function(error, response) {
        if (response != null) {
          _this.response = response;
          return _this.pp.prettyPrintIssue(response, details);
        } else {
          if (error != null) {
            _this.error = error;
          }
          return console.log(color("Error finding issue: " + error, "red"));
        }
      });
    };

    JiraHelper.prototype.getIssueTypes = function(callback) {
      var _this = this;
      return this.jira.listIssueTypes(function(error, response) {
        if (response != null) {
          return callback(response);
        } else {
          console.log(color("Error listing issueTypes: " + error, "red"));
          return process.exit();
        }
      });
    };

    JiraHelper.prototype.addIssue = function(summary, description, issueType, project) {
      var newIssue,
        _this = this;
      newIssue = {
        fields: {
          project: {
            id: project
          },
          summary: summary,
          issuetype: {
            id: issueType
          },
          assignee: {
            name: this.config.user
          },
          description: description
        }
      };
      return this.jira.addNewIssue(newIssue, function(error, response) {
        if (response != null) {
          if (response != null) {
            _this.response = response;
          }
          console.log(("Issue " + response.key + " has ") + ("been " + (color("created", "green"))));
        } else {
          if (error != null) {
            _this.error = error;
          }
          console.log(color("Error creating issue: " + ("" + (JSON.stringify(error))), "red"));
        }
        return process.exit();
      });
    };

    JiraHelper.prototype.deleteIssue = function(issueNum) {
      var _this = this;
      return this.jira.deleteIssue(issueNum, function(error, response) {
        if (response != null) {
          _this.response = response;
          return console.log("Issue " + issueNum + " was " + (color("deleted", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          return console.log(color("Error deleting issue: " + error, "red"));
        }
      });
    };

    JiraHelper.prototype.addWorklog = function(issueId, comment, timeSpent, exit) {
      var worklog,
        _this = this;
      worklog = {
        comment: comment,
        timeSpent: timeSpent
      };
      return this.jira.addWorklog(issueId, worklog, function(error, response) {
        if (response != null) {
          console.log("Worklog was " + (color("added", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          console.log(color("Error adding worklog: " + error, "red"));
        }
        if (exit) {
          return process.exit();
        }
      });
    };

    JiraHelper.prototype.listTransitions = function(issueNum, callback) {
      var _this = this;
      return this.jira.listTransitions(issueNum, function(error, transitions) {
        if (transitions != null) {
          return callback(transitions);
        } else {
          console.log(color("Error getting transitions: " + error, "red"));
          return process.exit();
        }
      });
    };

    JiraHelper.prototype.transitionIssue = function(issueNum, transitionNum) {
      var issueUpdate,
        _this = this;
      issueUpdate = {
        transition: {
          id: transitionNum
        }
      };
      return this.jira.transitionIssue(issueNum, issueUpdate, function(error, response) {
        if (response != null) {
          _this.response = response;
          console.log(("Issue " + issueNum + " ") + ("was " + (color("transitioned", "green"))));
        } else {
          if (error != null) {
            _this.error = error;
          }
          console.log(color("Error transitioning issue: " + error, "red"));
        }
        return process.exit();
      });
    };

    JiraHelper.prototype.searchJira = function(searchQuery, details) {
      var fields,
        _this = this;
      fields = ["summary", "status", "assignee"];
      return this.jira.searchJira(searchQuery, fields, function(error, issueList) {
        var issue, _i, _len, _ref, _results;
        if (issueList != null) {
          _this.myIssues = issueList;
          _ref = issueList.issues;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            issue = _ref[_i];
            _results.push(_this.pp.prettyPrintIssue(issue, details));
          }
          return _results;
        } else {
          if (error != null) {
            _this.error = error;
          }
          return console.log(color("Error retreiving issues list: ", +("" + error), "red"));
        }
      });
    };

    JiraHelper.prototype.getMyIssues = function(open, details, projects) {
      var jql;
      jql = "assignee = " + this.config.user;
      if (open) {
        jql += ' AND status in (Open, "In Progress", Reopened)';
      }
      if (projects != null) {
        jql += projects;
      }
      this.searchJira(jql, details);
    };

    JiraHelper.prototype.getMyProjects = function(callback) {
      var _this = this;
      return this.jira.listProjects(function(error, projectList) {
        if (projectList != null) {
          return callback(projectList);
        } else {
          console.log(color("Error listing projects: " + error, "red"));
          return process.exit();
        }
      });
    };

    return JiraHelper;

  })();

  module.exports = {
    JiraHelper: JiraHelper
  };

}).call(this);
