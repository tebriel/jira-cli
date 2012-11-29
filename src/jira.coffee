fs = require 'fs'
path = require 'path'
JiraCli = require('./jira-cli').JiraCli
dutils = require('./data-utils')

paramIsText = (param)->
    if typeof(param) is "boolean"
        argv.showHelp()
        return false
    true

loadConfigFile = ->
    configFile = path.join process.env.HOME, '.jiraclirc.json'
    unless fs.existsSync configFile
        console.log "Get your crap together and get a config file"
        console.log configFile
        return
    configFile = fs.readFileSync configFile

    JSON.parse configFile

transitionItem = (issueId) ->
    jiraCli.listTransitions issueId, (transitions) ->
        transitions.sort dutils.itemSorter
        for transition in transitions
            jiraCli.pp.prettyPrintTransition transition
        allowedTypes = (transition.id for transition in transitions)
        allowedTypes = new RegExp "[#{allowedTypes.join '|'}]"
        dutils.ask "Transtion Type ", allowedTypes, (type)->
            dutils.ask "Comment for worklog (blank to skip)", /.*/, (comment)->
                if comment.length is 0
                    jiraCli.transitionIssue issueId, type
                    return
                dutils.ask "Time Spent (for worklog)", /.+/, (timeSpent)->
                    jiraCli.addWorklog issueId, comment, timeSpent, false
                    jiraCli.transitionIssue issueId, type
addWorklog = (issuedId) ->
    dutils.ask "Comment for worklog", /.+/, (comment)->
        dutils.ask "Time Spent (for worklog)", /.+/, (timeSpent)->
            jiraCli.addWorklog issueId, comment, timeSpent, true

listProjects = ->
    projects = jiraCli.getMyProjects (projects)=>
        for project in projects
            jiraCli.pp.prettyPrintProject project

getProject = (callback, defaultProj)->
    dutils.ask "Project (Enter for Default/? for list) [#{defaultProj}] ", /.*/, (project) ->
        unless project is '?'
            callback configFile.project
            return
        projects = jiraCli.getMyProjects (projects)=>
            for project in projects
                jiraCli.pp.prettyPrintProject project
            getProject callback, defaultProj

addItem = (project)->
    # Gather the summary, description, an type
    dutils.ask "Summary", /.+/, (summary)->
        dutils.ask "Description", /.+/, (description)->
            jiraCli.getIssueTypes (issueTypes)->
                issueTypes.sort dutils.itemSorter
                for type in issueTypes
                    jiraCli.pp.prettyPrintIssueTypes type
                    
                allowedTypes = (type.id for type in issueTypes)
                allowedTypes = new RegExp "[#{allowedTypes.join '|'}]"
                dutils.ask "Type ", allowedTypes, (type)->
                    jiraCli.addIssue summary, description, type, project

if require.main is module
    # Parse some options!!
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
        }).options('p', {
            alias:'projects'
            describe:'Lists all your viewable projects'
        }).options('w', {
            alias:'worklog'
            describe:'Adds work to your task'
        }).options('h', {
            alias:'help'
            describe:'Shows this help message'
        }).usage('Usage:\n\tjira -f EG-143\n\tjira -r EG-143')
        .string('f')
        .string('t')
        .string('w')

    if argv.argv.help
        argv.showHelp()
        return

    args = argv.argv
    configFile = loadConfigFile()

    jiraCli = new JiraCli configFile

    if args.l
        jiraCli.getMyIssues true
    else if args.c
        jiraCli.getMyIssues false
    else if args.p
        listProjects()
    else if args.a
        getProject addItem, configFile.project
    else if args.f?
        return unless paramIsText args.f
        jiraCli.getIssue args.f
    else if args.w?
        return unless paramIsText args.w
        addWorklog args.w
    else if args.t?
        return unless paramIsText args.t
        transitionItem args.t
    else
        argv.showHelp()
