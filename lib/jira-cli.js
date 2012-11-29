#!/usr/bin/env node

(function() {
  var JiraApi, JiraCli, args, argv, ask, color, configFile, fs, issueSorter, jiraCli, path, projects, util,
    _this = this;

  fs = require('fs');

  path = require('path');

  color = require('ansi-color').set;

  util = require('util');

  JiraApi = require('node-jira-devel').JiraApi;

  JiraCli = (function() {

    function JiraCli(config) {
      this.config = config;
      this.jira = new JiraApi('http', this.config.host, this.config.port, this.config.user, this.config.password, '2');
      this.response = null;
      this.error = null;
    }

    JiraCli.prototype.prettyPrintIssue = function(issue) {
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

    JiraCli.prototype.getIssue = function(issueNum) {
      var _this = this;
      return this.jira.findIssue(issueNum, function(error, response) {
        if (response != null) {
          _this.response = response;
          return _this.prettyPrintIssue(response);
        } else {
          if (error != null) {
            _this.error = error;
          }
          return console.log(color("Error finding issue: " + error, "red"));
        }
      });
    };

    JiraCli.prototype.prettyPrintIssueTypes = function(issueType) {
      process.stdout.write(color(issueType.id, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(issueType.name);
      if (issueType.description.length > 0) {
        process.stdout.write(" - ");
        process.stdout.write(issueType.description);
      }
      return process.stdout.write("\n");
    };

    JiraCli.prototype.getIssueTypes = function(callback) {
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

    JiraCli.prototype.addIssue = function(summary, description, issueType) {
      var newIssue,
        _this = this;
      newIssue = {
        fields: {
          project: {
            id: this.config.project
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
          console.log("Issue " + response.key + " has been " + (color("created", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          console.log(color("Error creating issue: " + (JSON.stringify(error)), "red"));
        }
        return process.exit();
      });
    };

    JiraCli.prototype.deleteIssue = function(issueNum) {
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

    JiraCli.prototype.addWorklog = function(issueId, comment, timeSpent, exit) {
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

    JiraCli.prototype.prettyPrintTransition = function(transition) {
      process.stdout.write(color(transition.id, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(transition.name);
      return process.stdout.write("\n");
    };

    JiraCli.prototype.listTransitions = function(issueNum, callback) {
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

    JiraCli.prototype.transitionIssue = function(issueNum, transitionNum, comment, timeSpent) {
      var issueUpdate,
        _this = this;
      issueUpdate = {
        transition: {
          id: transitionNum
        },
        worklog: {
          comment: comment,
          timeSpent: timeSpent
        }
      };
      return this.jira.transitionIssue(issueNum, issueUpdate, function(error, response) {
        if (response != null) {
          _this.response = response;
          console.log("Issue " + issueNum + " was " + (color("transitioned", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          console.log(color("Error transitioning issue: " + error, "red"));
        }
        return process.exit();
      });
    };

    JiraCli.prototype.getMyIssues = function(open) {
      var _this = this;
      return this.jira.getUsersIssues(this.config.user, open, function(error, issueList) {
        var issue, _i, _len, _ref, _results;
        if (issueList != null) {
          _this.myIssues = issueList;
          _ref = issueList.issues;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            issue = _ref[_i];
            _results.push(_this.prettyPrintIssue(issue));
          }
          return _results;
        } else {
          if (error != null) {
            _this.error = error;
          }
          return console.log(color("Error retreiving issues list: " + error, "red"));
        }
      });
    };

    JiraCli.prototype.prettyPrintProject = function(project) {
      process.stdout.write(color(project.key, "white+bold"));
      process.stdout.write(" - ");
      process.stdout.write(project.id);
      process.stdout.write(" - ");
      process.stdout.write(project.name);
      return process.stdout.write("\n");
    };

    JiraCli.prototype.getMyProjects = function(callback) {
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

    return JiraCli;

  })();

  module.exports = {
    JiraCli: JiraCli
  };

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
        stdout.write("It should match: " + format(+"\n"));
        return ask(question, format, callback);
      }
    });
  };

  issueSorter = function(a, b) {
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

  if (require.main === module) {
    argv = (require('optimist')).options('f', {
      alias: 'find',
      describe: 'Finds the specified Jira ID'
    }).options('a', {
      alias: 'add',
      describe: 'Allows you to add a new Jira Task'
    }).options('t', {
      alias: 'transition',
      describe: 'Allows you to resolve a specific Jira ID'
    }).options('l', {
      alias: 'list',
      describe: 'Lists all your open issues'
    }).options('p', {
      alias: 'projects',
      describe: 'Lists all your viewable projects'
    }).options('w', {
      alias: 'worklog',
      describe: 'Adds work to your task'
    }).options('h', {
      alias: 'help',
      describe: 'Shows this help message'
    }).usage('Usage: jira -f EG-143 -- jira -r EG-143').boolean('h').boolean('l').string('f').string('t').string('w');
    if (argv.argv.help) {
      argv.showHelp();
      return;
    }
    args = argv.argv;
    configFile = path.join(process.env.HOME, '.jiraclirc.json');
    if (!fs.existsSync(configFile)) {
      console.log("Get your crap together and get a config file");
      console.log(configFile);
      return;
    }
    configFile = fs.readFileSync(configFile);
    configFile = JSON.parse(configFile);
    jiraCli = new JiraCli(configFile);
    if (args.l) {
      jiraCli.getMyIssues(true);
      return;
    } else if (args.f != null) {
      jiraCli.getIssue(args.f);
      return;
    } else if (args.w != null) {
      if (typeof args.w === "boolean") {
        return;
      }
      ask("Comment for worklog", /.+/, function(comment) {
        return ask("Time Spent (for worklog)", /.+/, function(timeSpent) {
          return jiraCli.addWorklog(args.w, comment, timeSpent, true);
        });
      });
    } else if (args.t != null) {
      jiraCli.listTransitions(args.t, function(transitions) {
        var allowedTypes, transition, _i, _len;
        transitions.sort(issueSorter);
        for (_i = 0, _len = transitions.length; _i < _len; _i++) {
          transition = transitions[_i];
          jiraCli.prettyPrintTransition(transition);
        }
        allowedTypes = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = transitions.length; _j < _len1; _j++) {
            transition = transitions[_j];
            _results.push(transition.id);
          }
          return _results;
        })();
        allowedTypes = new RegExp("[" + (allowedTypes.join('|')) + "]");
        return ask("Transtion Type ", allowedTypes, function(type) {
          return ask("Comment for worklog", /.*/, function(comment) {
            if (comment.length === 0) {
              jiraCli.transitionIssue(args.t, type);
              return;
            }
            return ask("Time Spent (for worklog)", /.+/, function(timeSpent) {
              jiraCli.addWorklog(args.t, comment, timeSpent, false);
              return jiraCli.transitionIssue(args.t, type);
            });
          });
        });
      });
    } else if (args.p != null) {
      projects = jiraCli.getMyProjects(function(projects) {
        var project, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = projects.length; _i < _len; _i++) {
          project = projects[_i];
          _results.push(jiraCli.prettyPrintProject(project));
        }
        return _results;
      });
      return;
    } else if (args.a != null) {
      ask("Summary", /.+/, function(summary) {
        return ask("Description", /.+/, function(description) {
          return jiraCli.getIssueTypes(function(issueTypes) {
            var allowedTypes, type, _i, _len;
            issueTypes.sort(issueSorter);
            for (_i = 0, _len = issueTypes.length; _i < _len; _i++) {
              type = issueTypes[_i];
              jiraCli.prettyPrintIssueTypes(type);
            }
            allowedTypes = (function() {
              var _j, _len1, _results;
              _results = [];
              for (_j = 0, _len1 = issueTypes.length; _j < _len1; _j++) {
                type = issueTypes[_j];
                _results.push(type.id);
              }
              return _results;
            })();
            allowedTypes = new RegExp("[" + (allowedTypes.join('|')) + "]");
            return ask("Type ", allowedTypes, function(type) {
              return jiraCli.addIssue(summary, description, type);
            });
          });
        });
      });
    } else {
      argv.showHelp();
      return;
    }
  }

}).call(this);
