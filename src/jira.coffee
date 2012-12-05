# #Jira Command Line Client#
#
# This client depends on you having a json file in your home directory
# named '.jiraclirc.json' it must contain:
#
#     { 
#         "user": "USERNAME",
#         "password":"PASSWORD",
#         "host":"www.jira.com",
#         "port":80,
#         "project": 10100
#     }
#
# If not present, it will enter an interactive mode to create it with you
#
# JiraCli is on [github](https://github.com/tebriel/jira-cli)
fs = require 'fs'
path = require 'path'
# ## [JiraHelper docs/source](jira-cli.html)
JiraHelper = require('./jira-cli').JiraHelper
# ## [dutils docs/source](data-utils.html)
dutils = require('./data-utils')

# ## Create Config File ##
# 
# Creates a config file when one doesn't exist
createConfigFile = (aConfigFile) ->
    console.log "No config file found, answer these questions to create one!"
    dutils.ask "Username", /.+/, (username) ->
        dutils.ask "Password", /.+/, (password) ->
            dutils.ask "Jira Host", /.+/, (host) ->
                dutils.ask "Jira Port", /.+/, (port) ->
                    dutils.ask "Default Project", /.*/, (project) ->
                        config =
                            user:username
                            password:password
                            host:host
                            port:port
                            project:project

                        fs.writeFileSync aConfigFile, JSON.stringify(config), 'utf8'
                        console.log "File created and saved as #{aConfigFile}"
                        process.exit()


# ## Check for Text Parameter ##
#
# Optimist returns a `bool` if the param is given but with nothing following it
paramIsText = (param)->
    if typeof(param) is "boolean"
        argv.showHelp()
        return false
    true

# ## Load the Config File ##
#
loadConfigFile = (configFilePath) ->
    configFile = fs.readFileSync configFilePath

    JSON.parse configFile

# ## Transition Item ##
#
# This takes the issueId, lists the transitions available for the item and then
# lets the user apply that transition to the item. Optionally the user can
# specify a comment which will then prompt for time spent. This adds a work log
# item to the item before the transition.
transitionItem = (issueId) ->
    jiraCli.listTransitions issueId, (transitions) ->
        transitions.sort dutils.itemSorter
        for transition, index in transitions
            jiraCli.pp.prettyPrintTransition transition, index + 1
        allowedTypes = [1..transitions.length]
        #allowedTypes = new RegExp "[#{allowedTypes.join '|'}]"
        dutils.ask "Transtion Type ", allowedTypes, (type)->
            dutils.ask "Comment for worklog (blank to skip)", /.*/, (comment)->
                if comment.length is 0
                    jiraCli.transitionIssue issueId, transitions[type - 1].id
                    return
                dutils.ask "Time Spent (for worklog)", /.+/, (timeSpent)->
                    jiraCli.addWorklog issueId, comment, timeSpent, false
                    jiraCli.transitionIssue issueId, transitions[type - 1].id
        , allowedTypes

# ## Add Work Log ##
#
# This will add a comment and time spent as a worklog item attached to the
# issue
addWorklog = (issuedId) ->
    dutils.ask "Comment for worklog", /.+/, (comment)->
        dutils.ask "Time Spent (for worklog)", /.+/, (timeSpent)->
            jiraCli.addWorklog issueId, comment, timeSpent, true

# ## List Projects ##
#
# This will list all the projects available to you
listProjects = ->
    projects = jiraCli.getMyProjects (projects)=>
        for project in projects
            jiraCli.pp.prettyPrintProject project

# ## Get Project ##
# 
# Here we ask the user for their project, giving them an option for the
# default, ? for a list, or they can type in a number directly
#
# It calls itself if we list the projects, so that it can still be used to for
# what it was called to do
getProject = (callback, defaultProj)->
    dutils.ask "Project (Enter for Default/? for list) [#{defaultProj}] ", /.*/, (project) ->
        unless project is '?'
            callback configFile.project
            return
        projects = jiraCli.getMyProjects (projects)=>
            for project in projects
                jiraCli.pp.prettyPrintProject project
            getProject callback, defaultProj

# ## Add Item ##
#
# Adds an item to Jira. The project passed in comes from getProject currently.
# Takes a summary and a description then lists the issue types for the user to
# choose from
addItem = (project)->
    # Gather the summary, description, an type
    dutils.ask "Summary", /.+/, (summary)->
        dutils.ask "Description", /.+/, (description)->
            jiraCli.getIssueTypes (issueTypes)->
                issueTypes.sort dutils.itemSorter
                for type, index in issueTypes
                    jiraCli.pp.prettyPrintIssueTypes type, index + 1
                    
                allowedTypes = [1..issueTypes.length]
                dutils.ask "Type ", allowedTypes, (type)->
                    jiraCli.addIssue summary, description, issueTypes[type - 1].id, project
                , allowedTypes

# ## Main entry point ##
#
# Parses the arguments and then calls a function above
if require.main is module
    argv = (require 'optimist')
        .options('f', {
            alias:'find'
            describe:'Finds the specified Jira ID'
        }).options('a', {
            alias:'add'
            describe:'Allows you to add a new Jira Task'
        }).options('t', {
            alias:'transition'
            describe:'Allows you to resolve a specific Jira ID'
        }).options('l', {
            alias:'list'
            describe:'Lists all your open issues'
        }).options('c', {
            alias:'list-all'
            describe:'Lists all your issues'
        }).options('d', {
            alias:'details'
            describe:'Shows extra details (currently only for list)'
        }).options('p', {
            alias:'projects'
            describe:'Lists all your viewable projects'
        }).options('o', {
            describe:'Limits list to only this project'
        }).options('w', {
            alias:'worklog'
            describe:'Adds work to your task'
        }).options('s', {
            alias:'search'
            describe:'Pass a jql string to jira'
        }).options('h', {
            alias:'help'
            describe:'Shows this help message'
        }).usage('Usage:\n\tjira -f EG-143\n\tjira -r EG-143')
        .boolean('d')
        .string('s')
        .string('f')
        .string('t')
        .string('w')

    if argv.argv.help
        argv.showHelp()
        return
    args = argv.argv

    configFilePath = path.join process.env.HOME, '.jiraclirc.json'
    unless fs.existsSync configFilePath
        createConfigFile configFilePath
        return

    configFile = loadConfigFile(configFilePath)
    jiraCli = new JiraHelper configFile

    if args.l
        jiraCli.getMyIssues true, args.d, args.o
    else if args.c
        jiraCli.getMyIssues false, args.d, args.o
    else if args.s
        return unless paramIsText args.s
        jiraCli.searchJira args.s, args.d
    else if args.p
        listProjects()
    else if args.a
        getProject addItem, configFile.project
    else if args.f?
        return unless paramIsText args.f
        jiraCli.getIssue args.f, args.d
    else if args.w?
        return unless paramIsText args.w
        addWorklog args.w
    else if args.t?
        return unless paramIsText args.t
        transitionItem args.t
    else
        argv.showHelp()
