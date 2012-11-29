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
# JiraCli is on [github](https://github.com/tebriel/jira-cli)


fs = require 'fs'
path = require 'path'
# Because colors are pretty
color = require('ansi-color').set
util = require 'util'
# We're using node-jira-devel, [my version](https://github.com/tebriel/node-jira)
JiraApi = require('node-jira-devel').JiraApi


class JiraCli
    # Builds a new JiraCli with the config file
    constructor: (@config)->
        @jira = new JiraApi('http', @config.host, @config.port, @config.user, @config.password, '2')
        @response = null
        @error = null

    # Because I like colors, and I don't want to format them any more than this
    prettyPrintIssue: (issue)->
        sumColor = "green"
        sumColor = "red" if +issue.fields.status.id in [5,6]
        process.stdout.write color(issue.key, sumColor)
        process.stdout.write " - "
        process.stdout.write issue.fields.summary
        process.stdout.write "\n"

    # Searches Jira for the issue number requested
    # this can be either a key AB-123 or just the number 123456
    getIssue: (issueNum)->
        @jira.findIssue issueNum, (error, response) =>
            if response?
                @response = response
                @prettyPrintIssue response
            else
                @error = error if error?
                console.log color("Error finding issue: #{error}", "red")


    # ## Do some fancy formatting on issue types ##
    prettyPrintIssueTypes: (issueType)->
        process.stdout.write color(issueType.id, "white+bold")
        process.stdout.write " - "
        process.stdout.write issueType.name
        if issueType.description.length > 0
            process.stdout.write " - "
            process.stdout.write issueType.description
        process.stdout.write "\n"

    # ## Gets a list of all the available issue types ##
    getIssueTypes: (callback)->
        @jira.listIssueTypes (error, response) =>
            if response?
                callback response
            else
                console.log color("Error listing issueTypes: #{error}", "red")
                process.exit()

    # Takes in a summary, description, and issue type (1, 2, and 4 on my
    # servers) and creates a new issue, populating from your config file
    addIssue: (summary, description, issueType) ->
        # Bug == 1
        # New Feature == 2
        # Improvement == 4
        newIssue =
            fields:
                project: { id:@config.project }
                summary: summary
                issuetype: { id:issueType }
                assignee: { name:@config.user }
                description: description

        @jira.addNewIssue newIssue, (error, response) =>
            if response?
                @response = response if response?
                console.log "Issue #{response.key} has been #{color("created", "green")}"
            else
                # The error object is non-standard here from Jira, I'll parse
                # it better later
                @error = error if error?
                console.log color("Error creating issue: #{JSON.stringify(error)}", "red")

            process.exit()

    # Deletes an issue (if you have permissions) from Jira. I haven't tested
    # this successfully because I don't have permissions.
    deleteIssue: (issueNum)->
        # Don't have permissions currently
        @jira.deleteIssue issueNum, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("deleted", "green")}"
            else
                @error = error if error?
                console.log color("Error deleting issue: #{error}", "red")

    # ## Adds a simple worklog to an issue ##
    addWorklog: (issueId, comment, timeSpent, exit)->
        worklog =
            comment:comment
            timeSpent:timeSpent
        @jira.addWorklog issueId, worklog, (error, response)=>
            if response?
                console.log "Worklog was #{color("added", "green")}"
            else
                @error = error if error?
                console.log color("Error adding worklog: #{error}", "red")
            process.exit() if exit


    # ## Pretty Print Transition ##
    # 
    # Show a transition with the ID in bold followed by the name
    prettyPrintTransition: (transition) ->
        process.stdout.write color(transition.id, "white+bold")
        process.stdout.write " - "
        process.stdout.write transition.name
        process.stdout.write "\n"

    # ## Get Transitions List for an Issue ##
    listTransitions: (issueNum, callback) ->
        @jira.listTransitions issueNum, (error, transitions)=>
            if transitions?
                callback transitions
            else
                console.log color("Error getting transitions: #{error}", "red")
                process.exit()


    # Resolves an issue in Jira, defaults to "Resolved", though maybe someday I
    # should change it to "closed" or at least give an option
    transitionIssue: (issueNum, transitionNum, comment, timeSpent)->
        issueUpdate =
            transition:
                id:transitionNum
            worklog:
                comment:comment
                timeSpent:timeSpent
        @jira.transitionIssue issueNum, issueUpdate, (error, response) =>
            if response?
                @response = response
                console.log "Issue #{issueNum} was #{color("transitioned", "green")}"
            else
                @error = error if error?
                console.log color("Error transitioning issue: #{error}", "red")

            process.exit()

    # Gets a list of issues for the user listed in the config file, pretty
    # prints them and only shows open ones by default from the cli, probably
    # should add an option, though I don't know who wants to see all their
    # closed issues
    getMyIssues: (open)->
        @jira.getUsersIssues @config.user, open, (error, issueList) =>
            if issueList?
                @myIssues = issueList
                for issue in issueList.issues
                    @prettyPrintIssue issue
            else
                @error = error if error?
                console.log color("Error retreiving issues list: #{error}", "red")

    # ## Pretty Print Projects ##
    #
    # Prints the project list in a non-awful format
    prettyPrintProject: (project) ->
        process.stdout.write color(project.key, "white+bold")
        process.stdout.write " - "
        process.stdout.write project.id
        process.stdout.write " - "
        process.stdout.write project.name
        process.stdout.write "\n"

    # ## List all Projects ##
    # 
    # This lists all the projects viewable with your account
    getMyProjects: (callback)->
        @jira.listProjects (error, projectList) =>
            if projectList?
                callback projectList
            else
                console.log color("Error listing projects: #{error}", "red")
                process.exit()


module.exports = {
    JiraCli
}

# This is great, stole it from [St. On It](http://st-on-it.blogspot.com/2011/05/how-to-read-user-input-with-nodejs.html)
#
# Re-formatted it to be in coffeescript
ask = (question, format, callback) ->
    stdin = process.stdin
    stdout = process.stdout
 
    stdin.resume()
    stdout.write(question + ": ")
 
    stdin.once 'data', (data) ->
        data = data.toString().trim()
 
        if format.test data
            callback data
        else
            stdout.write("It should match: "+ format +"\n")
            ask(question, format, callback)
issueSorter = (a, b)->
    first = parseInt a.id
    second = parseInt b.id
    return -1 if first < second
    return 0 if first is second
    return 1 if first > second

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
        }).options('p', {
            alias:'projects'
            describe:'Lists all your viewable projects'
        }).options('w', {
            alias:'worklog'
            describe:'Adds work to your task'
        }).options('h', {
            alias:'help'
            describe:'Shows this help message'
        }).usage('Usage: jira -f EG-143 -- jira -r EG-143')
        .boolean('h')
        .boolean('l')
        .string('f')
        .string('t')
        .string('w')

    if argv.argv.help
        argv.showHelp()
        return

    args = argv.argv
    configFile = path.join process.env.HOME, '.jiraclirc.json'
    unless fs.existsSync configFile
        console.log "Get your crap together and get a config file"
        console.log configFile
        return
    configFile = fs.readFileSync configFile
    configFile = JSON.parse configFile

    jiraCli = new JiraCli configFile

    if args.l
        jiraCli.getMyIssues true
        return
    else if args.f?
        jiraCli.getIssue args.f
        return
    else if args.w?
        return if typeof(args.w) is "boolean"
        ask "Comment for worklog", /.+/, (comment)->
            ask "Time Spent (for worklog)", /.+/, (timeSpent)->
                jiraCli.addWorklog args.w, comment, timeSpent, true
    else if args.t?
        jiraCli.listTransitions args.t, (transitions) ->
            transitions.sort issueSorter
            for transition in transitions
                jiraCli.prettyPrintTransition transition
            allowedTypes = (transition.id for transition in transitions)
            allowedTypes = new RegExp "[#{allowedTypes.join '|'}]"
            ask "Transtion Type ", allowedTypes, (type)->
                ask "Comment for worklog", /.*/, (comment)->
                    if comment.length is 0
                        jiraCli.transitionIssue args.t, type
                        return
                    ask "Time Spent (for worklog)", /.+/, (timeSpent)->
                        jiraCli.addWorklog args.t, comment, timeSpent, false
                        jiraCli.transitionIssue args.t, type
    else if args.p?
        projects = jiraCli.getMyProjects (projects)=>
            for project in projects
                jiraCli.prettyPrintProject project
        return
    else if args.a?
        # Gather the summary, description, an type
        # This should poll jira to get a list of available types instead of
        # using my hardcoded ones
        ask "Summary", /.+/, (summary)->
            ask "Description", /.+/, (description)->
                jiraCli.getIssueTypes (issueTypes)->
                    issueTypes.sort issueSorter
                    for type in issueTypes
                        jiraCli.prettyPrintIssueTypes type
                        
                    allowedTypes = (type.id for type in issueTypes)
                    allowedTypes = new RegExp "[#{allowedTypes.join '|'}]"
                    ask "Type ", allowedTypes, (type)->
                        jiraCli.addIssue summary, description, type

    else
        argv.showHelp()
        return
