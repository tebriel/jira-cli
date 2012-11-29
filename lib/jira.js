#!/usr/bin/env node

(function() {
  var JiraHelper, addItem, addWorklog, args, argv, configFile, configFilePath, createConfigFile, dutils, fs, getProject, jiraCli, listProjects, loadConfigFile, paramIsText, path, transitionItem;

  fs = require('fs');

  path = require('path');

  JiraHelper = require('./jira-cli').JiraHelper;

  dutils = require('./data-utils');

  createConfigFile = function(aConfigFile) {
    console.log("No config file found, answer these questions to create one!");
    return dutils.ask("Username", /.+/, function(username) {
      return dutils.ask("Password", /.+/, function(password) {
        return dutils.ask("Jira Host", /.+/, function(host) {
          return dutils.ask("Jira Port", /.+/, function(port) {
            return dutils.ask("Default Project", /.*/, function(project) {
              var config;
              config = {
                user: username,
                password: password,
                host: host,
                port: port,
                project: project
              };
              fs.writeFileSync(aConfigFile, JSON.stringify(config), 'utf8');
              console.log("File created and saved as " + aConfigFile);
              return process.exit();
            });
          });
        });
      });
    });
  };

  paramIsText = function(param) {
    if (typeof param === "boolean") {
      argv.showHelp();
      return false;
    }
    return true;
  };

  loadConfigFile = function(configFilePath) {
    var configFile;
    configFile = fs.readFileSync(configFilePath);
    return JSON.parse(configFile);
  };

  transitionItem = function(issueId) {
    return jiraCli.listTransitions(issueId, function(transitions) {
      var allowedTypes, transition, _i, _len;
      transitions.sort(dutils.itemSorter);
      for (_i = 0, _len = transitions.length; _i < _len; _i++) {
        transition = transitions[_i];
        jiraCli.pp.prettyPrintTransition(transition);
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
      return dutils.ask("Transtion Type ", allowedTypes, function(type) {
        return dutils.ask("Comment for worklog (blank to skip)", /.*/, function(comment) {
          if (comment.length === 0) {
            jiraCli.transitionIssue(issueId, type);
            return;
          }
          return dutils.ask("Time Spent (for worklog)", /.+/, function(timeSpent) {
            jiraCli.addWorklog(issueId, comment, timeSpent, false);
            return jiraCli.transitionIssue(issueId, type);
          });
        });
      });
    });
  };

  addWorklog = function(issuedId) {
    return dutils.ask("Comment for worklog", /.+/, function(comment) {
      return dutils.ask("Time Spent (for worklog)", /.+/, function(timeSpent) {
        return jiraCli.addWorklog(issueId, comment, timeSpent, true);
      });
    });
  };

  listProjects = function() {
    var projects,
      _this = this;
    return projects = jiraCli.getMyProjects(function(projects) {
      var project, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = projects.length; _i < _len; _i++) {
        project = projects[_i];
        _results.push(jiraCli.pp.prettyPrintProject(project));
      }
      return _results;
    });
  };

  getProject = function(callback, defaultProj) {
    return dutils.ask("Project (Enter for Default/? for list) [" + defaultProj + "] ", /.*/, function(project) {
      var projects,
        _this = this;
      if (project !== '?') {
        callback(configFile.project);
        return;
      }
      return projects = jiraCli.getMyProjects(function(projects) {
        var _i, _len;
        for (_i = 0, _len = projects.length; _i < _len; _i++) {
          project = projects[_i];
          jiraCli.pp.prettyPrintProject(project);
        }
        return getProject(callback, defaultProj);
      });
    });
  };

  addItem = function(project) {
    return dutils.ask("Summary", /.+/, function(summary) {
      return dutils.ask("Description", /.+/, function(description) {
        return jiraCli.getIssueTypes(function(issueTypes) {
          var allowedTypes, type, _i, _len;
          issueTypes.sort(dutils.itemSorter);
          for (_i = 0, _len = issueTypes.length; _i < _len; _i++) {
            type = issueTypes[_i];
            jiraCli.pp.prettyPrintIssueTypes(type);
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
          return dutils.ask("Type ", allowedTypes, function(type) {
            return jiraCli.addIssue(summary, description, type, project);
          });
        });
      });
    });
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
    }).options('c', {
      alias: 'list-all',
      describe: 'Lists all your issues'
    }).options('p', {
      alias: 'projects',
      describe: 'Lists all your viewable projects'
    }).options('w', {
      alias: 'worklog',
      describe: 'Adds work to your task'
    }).options('h', {
      alias: 'help',
      describe: 'Shows this help message'
    }).usage('Usage:\n\tjira -f EG-143\n\tjira -r EG-143').string('f').string('t').string('w');
    if (argv.argv.help) {
      argv.showHelp();
      return;
    }
    args = argv.argv;
    configFilePath = path.join(process.env.HOME, '.jiraclirc.json');
    if (!fs.existsSync(configFilePath)) {
      createConfigFile(configFilePath);
      return;
    }
    configFile = loadConfigFile(configFilePath);
    jiraCli = new JiraHelper(configFile);
    if (args.l) {
      jiraCli.getMyIssues(true);
    } else if (args.c) {
      jiraCli.getMyIssues(false);
    } else if (args.p) {
      listProjects();
    } else if (args.a) {
      getProject(addItem, configFile.project);
    } else if (args.f != null) {
      if (!paramIsText(args.f)) {
        return;
      }
      jiraCli.getIssue(args.f);
    } else if (args.w != null) {
      if (!paramIsText(args.w)) {
        return;
      }
      addWorklog(args.w);
    } else if (args.t != null) {
      if (!paramIsText(args.t)) {
        return;
      }
      transitionItem(args.t);
    } else {
      argv.showHelp();
    }
  }

}).call(this);
