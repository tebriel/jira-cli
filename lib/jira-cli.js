(function() {
  var JiraApi, JiraCli, args, argv, ask, color, configFile, fs, jiraCli, path, util;

  fs = require('fs');

  path = require('path');

  color = require('ansi-color').set;

  util = require('util');

  JiraApi = require('jira').JiraApi;

  JiraCli = (function() {

    function JiraCli(config) {
      this.config = config;
      this.jira = new JiraApi('http', this.config.host, this.config.port, this.config.user, this.config.password, '2');
      this.response = null;
      this.error = null;
    }

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

    JiraCli.prototype.resolveIssue = function(issueNum) {
      var issueUpdate,
        _this = this;
      issueUpdate = {
        transition: {
          id: 5
        }
      };
      return this.jira.transitionIssue(issueNum, issueUpdate, function(error, response) {
        if (response != null) {
          _this.response = response;
          return console.log("Issue " + issueNum + " was " + (color("resolved", "green")));
        } else {
          if (error != null) {
            _this.error = error;
          }
          return console.log(color("Error resolving issue: " + error, "red"));
        }
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

  if (require.main === module) {
    argv = (require('optimist')).options('f', {
      alias: 'find',
      describe: 'Finds the specified Jira ID'
    }).options('a', {
      alias: 'add',
      describe: 'Allows you to add a new Jira Task'
    }).options('r', {
      alias: 'resolve',
      describe: 'Allows you to resolve a specific Jira ID'
    }).options('l', {
      alias: 'list',
      "default": false,
      describe: 'Lists all your open issues'
    }).options('h', {
      alias: 'help',
      describe: 'Shows this help message',
      "default": false
    }).usage('Usage: $0 -f "EG-143"\n $0 -r "EG-143"').boolean('h').boolean('l').string('f').string('r');
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
    } else if (args.r != null) {
      jiraCli.resolveIssue(args.r);
      return;
    } else if (args.a != null) {
      ask("Summary", /.+/, function(summary) {
        return ask("Description", /.+/, function(description) {
          return ask("Type (Bug:1, Feature:2, Improvement:4)", /[1|2|4]/, function(type) {
            return jiraCli.addIssue(summary, description, type);
          });
        });
      });
    } else {
      argv.showHelp();
      return;
    }
  }

}).call(this);
