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
      var allowedTypes, index, transition, _i, _j, _len, _ref, _results;
      transitions.sort(dutils.itemSorter);
      for (index = _i = 0, _len = transitions.length; _i < _len; index = ++_i) {
        transition = transitions[index];
        jiraCli.pp.prettyPrintTransition(transition, index + 1);
      }
      allowedTypes = (function() {
        _results = [];
        for (var _j = 1, _ref = transitions.length; 1 <= _ref ? _j <= _ref : _j >= _ref; 1 <= _ref ? _j++ : _j--){ _results.push(_j); }
        return _results;
      }).apply(this);
      return dutils.ask("Transtion Type ", allowedTypes, function(type) {
        return dutils.ask("Comment for worklog (blank to skip)", /.*/, function(comment) {
          if (comment.length === 0) {
            jiraCli.transitionIssue(issueId, transitions[type - 1].id);
            return;
          }
          return dutils.ask("Time Spent (for worklog)", /.+/, function(timeSpent) {
            jiraCli.addWorklog(issueId, comment, timeSpent, false);
            return jiraCli.transitionIssue(issueId, transitions[type - 1].id);
          });
        });
      }, allowedTypes);
    });
  };

  addWorklog = function(issueId) {
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
          var addIssueCallback, allowedTypes, index, type, _i, _j, _len, _ref, _results;
          console.log(issueTypes);
          issueTypes.sort(dutils.itemSorter);
          for (index = _i = 0, _len = issueTypes.length; _i < _len; index = ++_i) {
            type = issueTypes[index];
            jiraCli.pp.prettyPrintIssueTypes(type, index + 1);
          }
          allowedTypes = (function() {
            _results = [];
            for (var _j = 1, _ref = issueTypes.length; 1 <= _ref ? _j <= _ref : _j >= _ref; 1 <= _ref ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
          addIssueCallback = function(type) {
            return jiraCli.addIssue(summary, description, issueTypes[type - 1].id, project);
          };
          return dutils.ask("Type ", allowedTypes, addIssueCallback, allowedTypes);
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
    }).options('d', {
      alias: 'details',
      describe: 'Shows extra details (currently only for list)'
    }).options('p', {
      alias: 'projects',
      describe: 'Lists all your viewable projects'
    }).options('o', {
      describe: 'Limits list to only this project'
    }).options('w', {
      alias: 'worklog',
      describe: 'Adds work to your task'
    }).options('s', {
      alias: 'search',
      describe: 'Pass a jql string to jira'
    }).options('h', {
      alias: 'help',
      describe: 'Shows this help message'
    }).usage('Usage:\n\tjira -f EG-143\n\tjira -r EG-143').boolean('d').string('s').string('f').string('t').string('w');
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
    if (args.o != null) {
      if (args.o instanceof Array) {
        args.o = args.o.join(',');
      }
      args.o = " AND project in (" + args.o + ")";
    }
    if (args.l) {
      jiraCli.getMyIssues(true, args.d, args.o);
    } else if (args.c) {
      jiraCli.getMyIssues(false, args.d, args.o);
    } else if (args.s) {
      if (!paramIsText(args.s)) {
        return;
      }
      if (args.o != null) {
        args.s += args.o;
      }
      jiraCli.searchJira(args.s, args.d);
    } else if (args.p) {
      listProjects();
    } else if (args.a) {
      getProject(addItem, configFile.project);
    } else if (args.f != null) {
      if (!paramIsText(args.f)) {
        return;
      }
      jiraCli.getIssue(args.f, args.d);
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
