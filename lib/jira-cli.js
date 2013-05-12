(function() {
  var JiraApi, JiraHelper, Logger, PrettyPrinter, color;

  color = require('ansi-color').set;

  PrettyPrinter = require('./pretty-printer').PrettyPrinter;

  JiraApi = require('jira').JiraApi;

  Logger = (function() {

    function Logger() {}

    Logger.prototype.error = function(text) {
      return this.log(text, "red");
    };

    Logger.prototype.log = function(text, textColor) {
      if (textColor == null) {
        textColor = 'white';
      }
      return console.log(color(text, textColor));
    };

    return Logger;

  })();

  JiraHelper = (function() {

    function JiraHelper(config) {
      this.config = config;
      if (this.config.strictSSL == null) {
        this.config.strictSSL = true;
      }
      if (this.config.protocol == null) {
        this.config.protocol = 'http:';
      }
      this.jira = new JiraApi(this.config.protocol, this.config.host, this.config.port, this.config.user, this.config.password, '2', false, this.config.strictSSL);
      this.response = null;
      this.error = null;
      this.pp = new PrettyPrinter;
      this.log = new Logger;
    }

    JiraHelper.prototype.dieWithFire = function() {
      return process.exit();
    };

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
          return _this.log.error("Error finding issue: " + error);
        }
      });
    };

    JiraHelper.prototype.getIssueTypes = function(callback) {
      var _this = this;
      return this.jira.listIssueTypes(function(error, response) {
        if (response != null) {
          return callback(response);
        } else {
          _this.log.error("Error listing issueTypes: " + error);
          return _this.dieWithFire();
        }
      });
    };

    JiraHelper.prototype.createIssueObject = function(project, summary, issueType, description) {
      return {
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
    };

    JiraHelper.prototype.addIssue = function(summary, description, issueType, project) {
      var newIssue,
        _this = this;
      newIssue = this.createIssueObject(project, summary, issueType, description);
      return this.jira.addNewIssue(newIssue, function(error, response) {
        if (response != null) {
          if (response != null) {
            _this.response = response;
          }
          _this.log.log(("Issue " + response.key + " has ") + ("been " + (color("created", "green"))));
        } else {
          if (error != null) {
            _this.error = error;
          }
          _this.log.error("Error creating issue: " + (JSON.stringify(error)));
        }
        return _this.dieWithFire();
      });
    };

    JiraHelper.prototype.deleteIssue = function(issueNum) {
      var _this = this;
      return this.jira.deleteIssue(issueNum, function(error, response) {
        if (response != null) {
          _this.response = response;
          return _this.log.log("Issue " + issueNum + " was " + (color("deleted", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          return _this.log.error("Error deleting issue: " + error);
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
          _this.log.log("Worklog was " + (color("added", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          _this.log.error("Error adding worklog: " + error);
        }
        if (exit) {
          return _this.dieWithFire();
        }
      });
    };

    JiraHelper.prototype.listTransitions = function(issueNum, callback) {
      var _this = this;
      return this.jira.listTransitions(issueNum, function(error, transitions) {
        if (transitions != null) {
          return callback(transitions);
        } else {
          _this.log.error("Error getting transitions: " + error);
          return _this.dieWithFire();
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
          _this.log.log(("Issue " + issueNum + " ") + ("was " + (color("transitioned", "green"))));
        } else {
          if (error != null) {
            _this.error = error;
          }
          _this.log.error("Error transitioning issue: " + error);
        }
        return _this.dieWithFire();
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
          return _this.log.error("Error retreiving issues list: " + error);
        }
      });
    };

    JiraHelper.prototype.getMyIssues = function(open, details, projects) {
      var jql;
      jql = "assignee = \"" + this.config.user + "\"";
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
          _this.log.error("Error listing projects: " + error);
          return _this.dieWithFire();
        }
      });
    };

    return JiraHelper;

  })();

  module.exports = {
    JiraHelper: JiraHelper
  };

}).call(this);
